# Copyright 2015 California Institute of Technology.  ALL RIGHTS RESERVED.
# U.S. Government Sponsorship acknowledged.

"""
BLISS GUI

The bliss.gui module provides the web-based (HTML5/CSS/Javascript)
BLISS Graphical User Interface (GUI).
"""


# Gevent Monkey Patching
#
# From http://www.gevent.org/intro.html:
#
#     The functions in gevent.monkey carefully replace functions and
#     classes in the standard socket module with their cooperative
#     counterparts. That way even the modules that are unaware of
#     gevent can benefit from running in a multi-greenlet environment.
#
# And:
#
#     When monkey patching, it is recommended to do so as early as
#     possible in the lifetime of the process. If possible, monkey
#     patching should be the first lines executed.
#

import gevent
import gevent.event
import gevent.monkey; gevent.monkey.patch_all()
import geventwebsocket

import collections
import copy
import datetime
import json
import os
import socket
import struct
import time
import webbrowser

import bottle
import pkg_resources
import requests

import bliss
import bliss.core

from bliss.core import api, cfg, log, gds, tlm, cmd, util, evr, pcap


class HTMLRoot:
    Static = pkg_resources.resource_filename('bliss.gui', 'static/')
    User = bliss.config.get('gui.html.directory', Static)

SEQRoot = os.path.join(bliss.config._ROOT_DIR, 'seq')

if not os.path.exists(SEQRoot):
    SEQRoot = None

App     = bottle.Bottle()
Servers = [ ]

bottle.debug(True)
bottle.TEMPLATE_PATH.append(HTMLRoot.User)

CmdHistFile = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'bliss-gui-cmdhist.pcap')


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
        self.events          = api.GeventDeque(maxlen=maxlen)
        self.messages        = api.GeventDeque(maxlen=maxlen)
        self.telemetry       = api.GeventDeque(maxlen=maxlen)
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

    def addTelemetry (self, defn, packet):
        """Adds a telemetry packet to all Sessions in the store."""
        item = (defn, packet)
        SessionStore.History.telemetry.append(item)
        for session in self.values():
            session.telemetry.append(item)

    def addMessage (self, msg):
        """Adds a log message to all Sessions in the store."""
        SessionStore.History.messages.append(msg)
        for session in self.values():
            session.messages.append(msg)

    def addEvent (self, name, data):
        """Adds an event to all Sessions in the store."""
        event = { 'name': name, 'data': data }
        SessionStore.History.events.append(event)
        for session in self.values():
            session.events.append(event)

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
    def __init__ (self, listener, defn):
        super(UdpTelemetryServer, self).__init__(listener)
        self._defn = defn

    def start (self):
        values = self._defn.name, self.server_host, self.server_port
        log.info('Listening for %s telemetry on %s:%d (UDP)' % values)
        super(UdpTelemetryServer, self).start()

    def handle (self, packet, address):
        Sessions.addTelemetry(self._defn, packet)


def getBrowserName(browser):
    return getattr(browser, 'name', getattr(browser, '_name', '(none)'))


def init(host=None, port=8000):
    global Servers

    @App.route('/bliss/gui/static/<pathname:path>')
    def handle(pathname):
        return bottle.static_file(pathname, root=HTMLRoot.Static)

    @App.route('/<pathname:path>')
    def handle(pathname):
        return bottle.static_file(pathname, root=HTMLRoot.User)

    if host is None:
        host = 'localhost'

    for t in bliss.config.gui.telemetry:
        stream = cfg.BlissConfig(config=t).stream
        defn   = tlm.getDefaultDict().get(stream.name, None)
        if defn:
            Servers.append( UdpTelemetryServer(stream.port, defn) )

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


def __setResponseToEventStream():
    bottle.response.content_type  = 'text/event-stream'
    bottle.response.cache_control = 'no-cache'

def __setResponseToJSON():
    bottle.response.content_type  = 'application/json'
    bottle.response.cache_control = 'no-cache'


@App.route('/')
def handle ():
    Sessions.create()
    return bottle.template('index.html')


@App.route('/events', method='GET')
def handle ():
    """Endpoint that pushes Server-Sent Events to client"""
    with Sessions.current() as session:
        __setResponseToEventStream()
        yield 'event: connected\ndata:\n\n'

        while True:
            event = session.events.popleft()
            __setResponseToEventStream()
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
        __setResponseToEventStream()
        yield 'event: connected\ndata:\n\n'

        while True:
            msg = session.messages.popleft()
            __setResponseToEventStream()
            yield 'data: %s\n\n' % json.dumps(msg)


@App.route('/tlm/dict', method='GET')
def handle():
    return json.dumps( tlm.getDefaultDict().toJSON() )

@App.route('/cmd/dict', method='GET')
def handle():
    return json.dumps( cmd.getDefaultDict().toJSON() )

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
        __setResponseToEventStream()
        yield 'event: connected\ndata:\n\n'

        while True:
            msg = session.messages.popleft()
            __setResponseToEventStream()
            yield 'data: %s\n\n' % json.dumps(msg)


@App.route('/tlm/realtime')
def handle():
    with Sessions.current() as session:
        # A null-byte pad ensures wsock is treated as binary.
        pad   = bytearray(1)
        wsock = bottle.request.environ.get('wsgi.websocket')

        if not wsock:
            bottle.abort(400, 'Expected WebSocket request.')

        while True:
            defn, data = session.telemetry.popleft()
            wsock.send(pad + struct.pack('>I', defn.uid) + data)


@App.route('/seq', method='GET')
def handle():
    """Endpoint that provides a JSON array of filenames in the SEQRoot
    directory."""
    if SEQRoot is None:
        files = [ ]
    else:
        files = [ fn for fn in os.listdir(SEQRoot) if fn.endswith('.txt') ]

        return json.dumps( sorted(files) )


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
    seq_p = gevent.subprocess.Popen(["bliss-seq-send", seqfile],
                                    stdout=gevent.subprocess.PIPE)
    seq_out, seq_err = seq_p.communicate()
    if seq_p.returncode is not 0:
        if not seq_err:
            seq_err = "Unknown Error"
        Sessions.addEvent('seq:err', bn_seqfile + ': ' + seq_err)
        return

    Sessions.addEvent('seq:done', bn_seqfile)
