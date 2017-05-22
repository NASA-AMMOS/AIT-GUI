# Copyright 2015 California Institute of Technology.  ALL RIGHTS RESERVED.
# U.S. Government Sponsorship acknowledged.

"""
BLISS GUI

The bliss.gui module provides the web-based (HTML5/CSS/Javascript)
BLISS Graphical User Interface (GUI).
"""

import collections
import copy
import json
import os
import socket
import time
import webbrowser

import bottle
import gevent
import gevent.event
import gevent.monkey
import geventwebsocket
import requests

import bliss
from bliss.core import log

import bliss.core
from bliss.core import log, gds, tlm, cmd, util, evr, pcap

gevent.monkey.patch_all()

if 'gui' in bliss.config and 'html_root' in bliss.config.gui:
    cfg_path = bliss.config.gui.html_root
    cfg_path = os.path.expanduser(cfg_path)

    if os.path.isabs(cfg_path):
        HTMLRoot = cfg_path
    else:
        HTMLRoot = os.path.join(bliss.config._ROOT_DIR, cfg_path)

    HTMLRoot = os.path.normpath(HTMLRoot)
else:
    import pkg_resources
    HTMLRoot = pkg_resources.resource_filename('bliss.gui', 'static/')

SEQRoot = pkg_resources.resource_filename('bliss.gui', 'seq/')

App     = bottle.Bottle()
Servers = [ ]

bottle.debug(True)
bottle.TEMPLATE_PATH.append(HTMLRoot)

CmdHistFile = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'bliss-gui-cmdhist.pcap')


class Deque (object):
    """Deque

    A Python collections.deque that can be used in a Gevent context.
    Get operations will block until an item is available in the Deque.
    """

    def __init__ (self, maxlen=None, deque=None):
        """Creates a new Deque, optionally cloned from the existing deque.

        If maxlen is not specified or is None, deques may grow to an
        arbitrary length.  Otherwise, the deque is bounded to the
        specified maximum length.  Once a bounded length deque is full,
        when new items are added, a corresponding number of items are
        discarded from the opposite end.
        """
        if deque is None:
            self.deque = collections.deque(maxlen=maxlen)
        else:
            self.deque = copy.copy(deque)

        self.event = gevent.event.Event()

        if len(self.deque) > 0:
            self.event.set()

    def __copy__ (self):
        """Creates a new copy of this Deque (via Python copy.copy())."""
        return Deque(deque=self.deque)

    def __len__ (self):
        """The number of items in this Deque."""
        return len(self.deque)

    def get (self):
        """Removes and returns the oldest item inserted into this Deque.
        This method blocks if the Deque is empty.
        """
        self.event.wait()
        item = self.deque.popleft()

        if len(self.deque) is 0:
            self.event.clear()

        return item

    def put (self, item):
        """Adds item to this Deque.

        This method does not block.  Either the Deque grows to consume
        available memory, or if this Deque has a maxlen, the oldest
        inserted item is removed.
        """
        self.deque.append(item)
        self.event.set()
        


class Session (object):
    """Session

    A Session manages the state for a single GUI client connection.
    Sessions are managed through a SessionStore and may be used as a
    Python context.
    """

    def __init__ (self, store=None, maxlen=100):
        """Creates a new Session, capable of storing up to maxlen items of
        each event, message, and telemetry type.
        """
        self.events          = Deque(maxlen)
        self.messages        = Deque(maxlen)
        self.telemetry       = collections.defaultdict(lambda: Deque(maxlen))
        self._maxlen         = maxlen
        self._store          = store
        self._numConnections = 0
        
    def __enter__ (self):
        """Begins a Session context / connection."""
        self._numConnections += 1
        return self

    def __exit__ (self, exc_type, exc_value, traceback):
        """Ends a Session context / connection.

        If no more active connections exist, the Session is deleted
        from its SessionStore.
        """
        assert self._numConnections > 0
        self._numConnections -= 1

        # FIXME: Age sessions out of existence instead?
        # if self._numConnections is 0 and self._store is not None:
        #     self._store.remove(self)

    @property
    def id (self):
        """A unique identifier for this Session."""
        return str( id(self) )



class SessionStore (dict):
    """SessionStore

    A SessionStore manages one or more Sessions.  SessionStores
    associate a Session with a GUI clients through an HTTP cookie.
    """
    History = Session(maxlen=600)

    def __init__ (self, *args, **kwargs):
        """Creates a new SessionStore."""
        dict.__init__(self, *args, **kwargs)

    def addTelemetry (self, name, packet):
        """Adds a telemetry packet to all Sessions in the store."""
        SessionStore.History.telemetry[name].put(packet)
        for session in self.values():
            session.telemetry[name].put(packet)
            
    def addMessage (self, msg):
        """Adds a log message to all Sessions in the store."""
        SessionStore.History.messages.put(msg)
        for session in self.values():
            session.messages.put(msg)

    def addEvent (self, name, data):
        """Adds an event to all Sessions in the store."""
        event = { 'name': name, 'data': data }
        SessionStore.History.events.put(event)
        for session in self.values():
            session.events.put(event)

    def current (self):
        """Returns the current Session for this HTTP connection or raise an
        HTTP 401 Unauthorized error.
        """
        session = self.get( bottle.request.get_cookie('sid') )
        if session is None:
            raise bottle.HTTPError(401, 'Invalid Session Id')
        return session

    def create (self):
        """Creates and returns a new Session for this HTTP connection.
        """
        session          = Session(self)
        self[session.id] = session
        bottle.response.set_cookie('sid', session.id)
        return session

    def remove (self, session):
        """Removes the given Session from this SessionStore."""
        del self[session.id]


class UdpSysLogServer (gevent.server.DatagramServer):
    def __init__ (self, *args, **kwargs):
        gevent.server.DatagramServer.__init__(self, *args, **kwargs)
        self._parser = log.SysLogParser()

    def start (self):
        values = self.server_host, self.server_port
        log.info('Listening for Syslog messages on %s:%d (UDP)' % values)
        super(UdpSysLogServer, self).start()

    def handle (self, data, address):
        msg = self._parser.parse(data)
        Sessions.addMessage(msg)


class UdpTelemetryServer (gevent.server.DatagramServer):
    def __init__ (self, listener, name):
        super(UdpTelemetryServer, self).__init__(listener)
        self._name = name

    def start (self):
        values = self._name, self.server_host, self.server_port
        log.info('Listening for %s telemetry on %s:%d (UDP)' % values)
        super(UdpTelemetryServer, self).start()

    def handle (self, packet, address):
        Sessions.addTelemetry(self._name, packet)


def getBrowserName(browser):
    return getattr(browser, 'name', getattr(browser, '_name', '(none)'))


def init(host=None, port=8000):
    global Servers

    @App.route('/bliss/gui/static/<pathname:path>')
    def handle(pathname):
        return bottle.static_file(pathname, root=HTMLRoot)

    if host is None:
        host = 'localhost'

    for t in bliss.config.gui.telemetry:
        stream = t['stream']
        Servers.append( UdpTelemetryServer(stream['port'], stream['name']) )

    Servers.append( UdpSysLogServer(':%d' % 2514)     )
    Servers.append( gevent.pywsgi.WSGIServer(
        ('0.0.0.0', port),
        App,
        handler_class = geventwebsocket.handler.WebSocketHandler)
    )

    for s in Servers:
        s.start()


def cleanup():
    global Servers

    for s in Servers:
        s.stop()


def startBrowser(url, name=None):
    browser = None

    if name is not None and name.lower() == 'none':
        log.info('Will not start any browser since --browser=none')
        return

    try:
        browser = webbrowser.get(name)
    except webbrowser.Error:
        old     = name or 'default'
        msg     = 'Could not find browser: %s.  Will use: %s.'
        browser = webbrowser.get()
        log.warn(msg, name, getBrowserName(browser))

    if type(browser) is webbrowser.GenericBrowser:
        msg = 'Will not start text-based browser: %s.'
        log.info(msg % getBrowserName(browser))
    elif browser is not None:
        log.info('Starting browser: %s' % getBrowserName(browser))
        browser.open_new(url)


def wait():
    gevent.wait()


Sessions = SessionStore()


@App.route('/')
def handle ():
    Sessions.create()
    return bottle.template('index.html')


@App.route('/events', method='GET')
def handle ():
    """Endpoint that pushes Server-Sent Events to client"""
    with Sessions.current() as session:
        bottle.response.content_type  = 'text/event-stream'
        bottle.response.cache_control = 'no-cache'
        yield 'event: connected\ndata:\n\n'

        while True:
            event = session.events.get()
            bottle.response.content_type  = 'text/event-stream'
            bottle.response.cache_control = 'no-cache'
            yield 'data: %s\n\n' % json.dumps(event)


@App.route('/events', method='POST')
def handle ():
    with Sessions.current() as session:
        name = bottle.request.POST.name
        data = bottle.request.POST.data
        Sessions.addEvent(name, data)


@App.route('/messages', method='GET')
def handle():
    """Endpoint that pushes syslog output to client"""
    with Sessions.current() as session:
        bottle.response.content_type  = 'text/event-stream'
        bottle.response.cache_control = 'no-cache'
        yield 'event: connected\ndata:\n\n'

        while True:
            msg = session.messages.get()
            bottle.response.content_type  = 'text/event-stream'
            bottle.response.cache_control = 'no-cache'
            yield 'data: %s\n\n' % json.dumps(msg)


@App.route('/tlm/dict', method='GET')
def handle():
    return json.dumps( tlm.getDefaultDict().toDict() )

@App.route('/cmd/dict', method='GET')
def handle():
    print '/cmd/dict'
    return json.dumps(cmd.getDefaultDict().toDict())

@App.route('/cmd/hist.json', method='GET')
def handle():
    cmds = []

    try:
        with pcap.open(CmdHistFile, 'r') as stream:
            cmds = [cmdname for (header, cmdname) in stream]
    except IOError:
        pass

    return json.dumps(list(set(cmds)))

@App.route('/cmd', method='POST')
def handle():
    with Sessions.current() as session:
        command = bottle.request.forms.get('command').strip()

        if len(command) > 0:
            cmddict = cmd.getDefaultCmdDict()
            host = '127.0.0.1'
            port = 3075
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            verbose = False

            if cmddict is not None:
                args = command.split()
                name = args[0]
                args = [util.toNumber(t, t) for t in args[1:]]
                cmdobj = cmddict.create(name, *args)
                messages = []

            if cmdobj is None:
                log.error('unrecognized command: %s' % name)
            elif not cmdobj.validate(messages):
                for msg in messages:
                    log.error(msg)
            else:
                encoded = cmdobj.encode()

                if verbose:
                    size = len(cmdobj.name)
                    pad = (size - len(cmdobj.name) + 1) * ' '
                    gds.hexdump(encoded, preamble=cmdobj.name + ':' + pad)

                try:
                    log.info('Sending to %s:%d: %s', host, port, cmdobj.name)
                    sock.sendto(encoded, (host, port))

                    with pcap.open(CmdHistFile, 'a') as output:
                        output.write(command)

                    Sessions.addEvent('cmd:hist', command)
                except socket.error, err:
                    log.error(str(err))
                except IOError, err:
                    log.error(str(err))

@App.route('/log', method='GET')
def handle():
    """Endpoint that pushes syslog output to client"""
    with Sessions.current() as session:
        bottle.response.content_type  = 'text/event-stream'
        bottle.response.cache_control = 'no-cache'
        yield 'event: connected\ndata:\n\n'

        while True:
            msg = session.messages.get()
            bottle.response.content_type  = 'text/event-stream'
            bottle.response.cache_control = 'no-cache'
            yield 'data: %s\n\n' % json.dumps(msg)


@App.route('/tlm/stream')
def handle():
    with Sessions.current() as session:
        # A byte of padding makes sure that the stream is treated as binary.
        pad     = bytearray(1)
        wsock   = bottle.request.environ.get('wsgi.websocket')

        if not wsock:
            bottle.abort(400, 'Expected WebSocket request.')

        while True:
            tlm = session.telemetry.get()
            # The byte of 0x00 padding makes sure that the stream is treated as
            # binary data
            wsock.send(pad + tlm)


@App.route('/tlm/realtime/<pname>/json', method='GET')
def handle(pname):
    """Endpoint that pushes syslog output to client"""
    with Sessions.current() as session:
        defn = tlm.getDefaultDict()[pname]
        hist = tlm.PacketHistory(defn)

        bottle.response.content_type  = 'text/event-stream'
        bottle.response.cache_control = 'no-cache'
        yield 'event: connected\ndata:\n\n'

        while True:
            data   = session.telemetry[pname].get()
            packet = tlm.Packet(defn, data, hist)
            msg    = { }

            for fname in defn.fieldmap.keys():
                msg[fname] = getattr(packet, fname)

            bottle.response.content_type  = 'text/event-stream'
            bottle.response.cache_control = 'no-cache'
            yield 'data: %s\n\n' % json.dumps(msg)


@App.route('/seq', method='GET')
def handle():
    """Endpoint that provides a JSON array of filenames in the SEQRoot
    directory."""
    files = [ fn for fn in os.listdir(SEQRoot) if fn.endswith('.txt') ]
    return json.dumps(sorted(files))


@App.route('/seq', method='POST')
def handle():
    bn_seqfile = bottle.request.forms.get('seqfile')
    gevent.spawn(bgExecSeq, bn_seqfile)


def bgExecSeq(bn_seqfile):
    seqfile = os.path.join(SEQRoot, bn_seqfile)
    if not os.path.isfile(seqfile):
        msg  = "Sequence file not found.  "
        msg += "Reload page to see updated list of files."
        log.error(msg)
        return

    log.info("Executing sequence: " + seqfile)
    Sessions.addEvent('seq:exec', bn_seqfile)
    seq_p = gevent.subprocess.Popen(["bliss_seq_send.py", seqfile],
                                    stdout=gevent.subprocess.PIPE)
    seq_out, seq_err = seq_p.communicate()
    if seq_p.returncode is not 0:
        if not seq_err:
            seq_err = "Unknown Error"
        Sessions.addEvent('seq:err', bn_seqfile + ': ' + seq_err)
        return

    Sessions.addEvent('seq:done', bn_seqfile)
