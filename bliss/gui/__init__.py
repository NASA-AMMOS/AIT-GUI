# Advanced Multi-Mission Operations System (AMMOS) Instrument Toolkit (AIT)
# Bespoke Link to Instruments and Small Satellites (BLISS)
#
# Copyright 2015, by the California Institute of Technology. ALL RIGHTS
# RESERVED. United States Government Sponsorship acknowledged. Any
# commercial use must be negotiated with the Office of Technology Transfer
# at the California Institute of Technology.
#
# This software may be subject to U.S. export control laws. By accepting
# this software, the user agrees to comply with all applicable U.S. export
# laws and regulations. User has the responsibility to obtain export licenses,
# or other export authority as may be required before exporting such
# information to foreign countries or providing access to foreign persons.
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
import gevent.lock
import gevent.monkey; gevent.monkey.patch_all()
import geventwebsocket

import bdb
import collections
import copy
import datetime
import json
import os
import socket
import struct
import sys
import time
import urllib
import webbrowser

import bottle
import pkg_resources
import requests

import bliss
import bliss.core

from bliss.core import api, ccsds, cfg, cmd, evr, gds, limits, log, pcap, tlm
from bliss.core import util


_RUNNING_SCRIPT = None

class HTMLRoot:
    Static = pkg_resources.resource_filename('bliss.gui', 'static/')
    User   = bliss.config.get('gui.html.directory', Static)

SEQRoot = bliss.config.get('sequence.directory', None)
ScriptRoot = bliss.config.get('script.directory', None)
CmdHistFile = bliss.config.get('command.history.filename',
                os.path.join(bliss.config._ROOT_DIR, 'bliss-gui-cmdhist.pcap'))

if SEQRoot and not os.path.isdir(SEQRoot):
    msg = 'sequence.directory does not exist. Sequence loads may fail.'
    bliss.core.log.warn(msg)

if ScriptRoot and not os.path.isdir(ScriptRoot):
    msg = (
        'script.directory points to a directory that does not exist. '
        'Script loads may fail.'
    )
    bliss.core.log.warn(msg)

if not os.path.isfile(CmdHistFile):
    if not os.path.isdir(os.path.dirname(CmdHistFile)):
        msg  = 'command.history.filename directory does not exist.  '
        msg += 'Command history will not be saved.'
        bliss.core.log.warn(msg)

App     = bottle.Bottle()
Servers = [ ]

bottle.debug(True)
bottle.TEMPLATE_PATH.append(HTMLRoot.User)

try:
    with open(os.path.join(HTMLRoot.Static, 'package.json')) as infile:
        package_data = json.loads(infile.read())
    VERSION = 'BLISS GUI v{}'.format(package_data['version'])
    log.info('Running {}'.format(VERSION))
except:
    VERSION = ''
    log.warn('Unable to determine which BLISS GUI Version is running')


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

    def addTelemetry (self, uid, packet):
        """Adds a telemetry packet to all Sessions in the store."""
        item = (uid, packet)
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

    def start (self):
        values = self.server_host, self.server_port
        log.info('Listening for Syslog messages on %s:%d (UDP)' % values)
        super(UdpSysLogServer, self).start()

    def handle (self, data, address):
        msg = log.parseSyslog(data)
        Sessions.addMessage(msg)


class UdpCcsdsTelemetryServer(gevent.server.DatagramServer):
    """A UdpCcsdsTelemetryServer listens for CCSDS telemetry packets on
    the given (hostname, port) and forwards those packets to the GUI
    client with minimal sanity checking.
    """

    def __init__ (self, listener):
        super(UdpCcsdsTelemetryServer, self).__init__(listener)

    def start (self):
        values = self.server_host, self.server_port
        log.info('Listening for CCSDS telemetry on %s:%d (UDP)' % values)
        super(UdpCcsdsTelemetryServer, self).start()

    def handle (self, data, address):
        if len(data) > ccsds.CcsdsHeader.Definition.nbytes:
            header = ccsds.CcsdsHeader(data)
            Sessions.addTelemetry(header.apid, data)
        else:
            values = len(data), self.server_host, self.server_port
            msg    = 'Ignoring %d byte packet fragment on %s:%d (UDP)'
            log.warn(msg % values)



class UdpRawTelemetryServer(gevent.server.DatagramServer):
    def __init__ (self, listener, defn):
        super(UdpRawTelemetryServer, self).__init__(listener)
        self._defn = defn

    def start (self):
        values = self._defn.name, self.server_host, self.server_port
        log.info('Listening for %s telemetry on %s:%d (UDP)' % values)
        super(UdpRawTelemetryServer, self).start()

    def handle (self, packet, address):
        Sessions.addTelemetry(self._defn.uid, packet)


def getBrowserName(browser):
    return getattr(browser, 'name', getattr(browser, '_name', '(none)'))


def init(host=None, port=8080):
    global Servers

    @App.route('/bliss/gui/static/<pathname:path>')
    def handle(pathname):
        return bottle.static_file(pathname, root=HTMLRoot.Static)

    @App.route('/<pathname:path>')
    def handle(pathname):
        return bottle.static_file(pathname, root=HTMLRoot.User)

    if host is None:
        host = 'localhost'

    streams = bliss.config.get('gui.telemetry')

    if streams is None:
        msg  = cfg.BlissConfigMissing('gui.telemetry').args[0]
        msg += '  No telemetry will be received (or displayed).'
        log.error(msg)
    else:
        nstreams = 0

        for index, s in enumerate(streams):
            param  = 'gui.telemetry[%d].stream' % index
            stream = cfg.BlissConfig(config=s).get('stream')

            if stream is None:
                msg = cfg.BlissConfigMissing(param).args[0]
                log.warn(msg + '  Skipping stream.')
                continue

            name  = stream.get('name', '<unnamed>')
            type  = stream.get('type', 'raw').lower()
            tport = stream.get('port', None)

            if tport is None:
                msg = cfg.BlissConfigMissing(param + '.port').args[0]
                log.warn(msg + '  Skipping stream.')
                continue

            if type == 'ccsds':
                Servers.append( UdpCcsdsTelemetryServer(tport) )
                nstreams += 1
            else:
                defn = tlm.getDefaultDict().get(name, None)

                if defn is None:
                    values = (name, param)
                    msg    = 'Packet name "%s" not found (%s.name).' % values
                    log.warn(msg + '  Skipping stream.')
                    continue

                Servers.append( UdpRawTelemetryServer(tport, defn) )
                nstreams += 1

    if streams and nstreams == 0:
        msg  = 'No valid telemetry stream configurations found.'
        msg += '  No telemetry will be received (or displayed).'
        log.error(msg)

    Servers.append(
        UdpSysLogServer(':%d' % bliss.config.get('logging.port', 2514))
    )

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
    """Return index page"""
    Sessions.create()
    return bottle.template('index.html', version=VERSION)


@App.route('/events', method='GET')
def handle ():
    """Endpoint that pushes Server-Sent Events to client"""
    with Sessions.current() as session:
        __setResponseToEventStream()
        yield 'event: connected\ndata:\n\n'

        while True:
            try:
                event = session.events.popleft(timeout=30)
                __setResponseToEventStream()
                yield 'data: %s\n\n' % json.dumps(event)
            except IndexError as e:
                yield 'event: probe\ndata:\n\n'


@App.route('/events', method='POST')
def handle():
    """Add an event to the event stream

    :jsonparam name: The name of the event to add.
    :jsonparam data: The data to include with the event.
    """
    with Sessions.current() as session:
        name = bottle.request.POST.name
        data = bottle.request.POST.data
        Sessions.addEvent(name, data)


@App.route('/evr/dict', method='GET')
def handle():
    """Return JSON EVR dictionary"""
    return json.dumps(evr.getDefaultDict().toJSON())


@App.route('/messages', method='GET')
def handle():
    """Endpoint that pushes syslog output to client"""
    with Sessions.current() as session:
        __setResponseToEventStream()
        yield 'event: connected\ndata:\n\n'

        while True:
            try:
                msg = session.messages.popleft(timeout=30)
                __setResponseToEventStream()
                yield 'data: %s\n\n' % json.dumps(msg)
            except IndexError:
                yield 'event: probe\ndata:\n\n'


@App.route('/tlm/dict', method='GET')
def handle():
    """Return JSON Telemetry dictionary

    **Example Response**:

    .. sourcecode: json

       {
           ExaplePacket1: {
               uid: 1,
               fields: {
                   Voltage_B: {
                       type: "MSB_U16",
                       bytes: [2, 3],
                       name: "Voltage_B",
                       desc: "Voltage B as a 14-bit DN. Conversion to engineering units is TBD."
                   },
                   Voltage_C: {
                       type: "MSB_U16",
                       bytes: [4, 5],
                       name: "Voltage_C",
                       desc: "Voltage C as a 14-bit DN. Conversion to engineering units is TBD."
                   },
                   ...
               }
           },
           ExamplePacket2: {
               ...
           }
       }
    """
    return json.dumps( tlm.getDefaultDict().toJSON() )

@App.route('/cmd/dict', method='GET')
def handle():
    """Return JSON Command dictionary

    **Example Response**:

    .. sourcecode: json

       {
           NO_OP: {
               subsystem: "CORE",
               name: "NO_OP",
               title: "NO_OP",
               opcode: 1,
               arguments: [],
               desc: "Standard NO_OP command. "
           },
           SEQ_START: {
               subsystem: "CMD",
               name: "SEQ_START",
               title: "Start Sequence",
               opcode: 2,
               arguments: [
                   {
                       name: "sequence_id",
                       bytes: [0, 1],
                       units: "none",
                       fixed: false,
                       type: "MSB_U16",
                       desc: "Sequence ID"
                   }
               ],
               desc: "This command starts a specified command sequence. "
            },
           ...
       }
    """
    return json.dumps( cmd.getDefaultDict().toJSON() )

@App.route('/cmd/hist.json', method='GET')
def handle():
    """Return sent command history

    **Example Response**:

    .. sourcecode: json

       [
           "NO_OP",
           "SEQ_START 3423"
       ]

    If you set the **detailed** query string flag the JSON
    returned will include timestamp information.

    **Example Detailed Response**

    .. sourcecode: json

        [
            {
                "timestamp": "2017-08-01 15:41:13.117805",
                "command": "NO_OP"
            },
            {
                "timestamp": "2017-08-01 15:40:23.339886",
                "command": "NO_OP"
            }
        ]
    """
    cmds = []

    try:
        with pcap.open(CmdHistFile, 'r') as stream:
            if 'detailed' in bottle.request.query:
                cmds = [
                    {
                        'timestamp': str(header.timestamp),
                        'command': cmdname
                    }
                    for (header, cmdname) in stream
                ]
                return json.dumps(list(reversed(cmds)))
            else:
                cmds = [cmdname for (header, cmdname) in stream]
                return json.dumps(list(set(cmds)))
    except IOError:
        pass


@App.route('/cmd', method='POST')
def handle():
    """Send a given command

    :formparam command: The command that should be sent. If arguments
                        are to be included they should be separated via
                        whitespace.

    **Example command format**

    .. sourcecode:

       myExampleCommand argumentOne argumentTwo

    """
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
    """Return telemetry packets in realtime to client"""
    with Sessions.current() as session:
        # A null-byte pad ensures wsock is treated as binary.
        pad   = bytearray(1)
        wsock = bottle.request.environ.get('wsgi.websocket')

        if not wsock:
            bottle.abort(400, 'Expected WebSocket request.')

        try:
            while not wsock.closed:
                try:
                    uid, data = session.telemetry.popleft(timeout=30)
                    wsock.send(pad + struct.pack('>I', uid) + data)
                except IndexError:
                    # If no telemetry has been received by the GUI
                    # server after timeout seconds, "probe" the client
                    # websocket connection to make sure it's still
                    # active and if so, keep it alive.  This is
                    # accomplished by sending a packet with an ID of
                    # zero and no packet data.  Packet ID zero with no
                    # data is ignored by BLISS GUI client-side
                    # Javascript code.

                    if not wsock.closed:
                        wsock.send(pad + struct.pack('>I', 0))
        except geventwebsocket.WebSocketError:
            pass


@App.route('/seq', method='GET')
def handle():
    """Return a JSON array of filenames in the SEQRoot directory

    **Example Response**:

    .. sourcecode: json

       [
            sequenceOne.txt,
            sequenceTwo.txt
       ]
    """
    if SEQRoot is None:
        files = [ ]
    else:
        files = util.listAllFiles(SEQRoot, '.txt')

        return json.dumps( sorted(files) )


@App.route('/seq', method='POST')
def handle():
    """Run requested sequence file

    :formparam seqfile: The sequence filename located in SEQRoot to execute
    """
    with Sessions.current() as session:
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


script_exec_lock = gevent.lock.Semaphore(1)


@App.route('/scripts', method='GET')
def handle():
    """ Return a JSON array of script filenames

    Scripts are located via the script.directory configuration parameter.
    """
    with Sessions.current() as session:
        if ScriptRoot is None:
            files = []
        else:
            files = util.listAllFiles(ScriptRoot, '.py')

        return json.dumps(sorted(files))


@App.route('/scripts/load/<name>', method='GET')
def handle(name):
    """ Return the text of a script

    Scripts are located via the script.directory configuration parameter.

    :param name: The name of the script to load. Should be one of the values
                 returned by **/scripts**.

    :statuscode 400: When the script name cannot be located

    **Example Response**:

    .. sourcecode: json

       {
           script_text: "This is the example content of a fake script"
       }
    """
    with Sessions.current() as session:
        script_path = os.path.join(ScriptRoot, urllib.unquote(name))
        if not os.path.exists(script_path):
            bottle.abort(400, "Script cannot be located")

        with open(script_path) as infile:
            script_text = infile.read()

        return json.dumps({"script_text": script_text})


@App.route('/script/run', method='POST')
def handle():
    """ Run a script

    Scripts are located via the script.directory configuration parameter.

    :formparam scriptPath: The name of the script to load. This should be one
                           of the values returned by **/scripts**.

    :statuscode 400: When the script name cannot be located
    """
    global _RUNNING_SCRIPT
    with Sessions.current() as session:
        script_name = bottle.request.forms.get('scriptPath')
        script_path = os.path.join(ScriptRoot, script_name)

        if not os.path.exists(script_path):
            bottle.abort(400, "Script cannot be located")

        _RUNNING_SCRIPT = gevent.spawn(bgExecScript, script_path)


@App.route('/script/run', method='PUT')
def handle():
    """ Resume a paused script """
    with Sessions.current() as session:
        script_exec_lock.release()
        Sessions.addEvent('script:resume', None)


@App.route('/script/pause', method='PUT')
def handle():
    """ Pause a running script """
    with Sessions.current() as session:
        script_exec_lock.acquire()
        Sessions.addEvent('script:pause', None)


@App.route('/script/step', method='PUT')
def handle():
    """ Step a paused script """
    with Sessions.current() as session:
        script_exec_lock.release()
        gevent.sleep(0)
        script_exec_lock.acquire()


@App.route('/script/abort', method='DELETE')
def handle():
    """ Abort a running script """
    with Sessions.current() as session:
        if not script_exec_lock.locked():
            script_exec_lock.acquire()

        if _RUNNING_SCRIPT:
            _RUNNING_SCRIPT.kill()
        script_exec_lock.release()
        Sessions.addEvent('script:aborted', None)


def bgExecScript(script_path):
    debugger = BlissDB()
    with open(script_path) as infile:
        script = infile.read()

    Sessions.addEvent('script:start', None)
    try:
        debugger.run(script)
        Sessions.addEvent('script:done', None)
    except Exception as e:
        bliss.core.log.error('Script execution error: {}: {}'.format(
            sys.exc_info()[0].__name__,
            e
        ))
        Sessions.addEvent('script:error', str(e))


class BlissDB(bdb.Bdb):
    def user_line(self, frame):
        fn = self.canonic(frame.f_code.co_filename)
        # When executing our script the code location will be
        # denoted as "<string>" since we're passing the script
        # to the debugger as such. If we don't check for this we'll
        # end up with a bunch of execution noise (specifically gevent
        # function calls). We also only want to report line changes
        # in the current script. A check that the `co_name` is
        # '<module>' ensures this.
        if fn == "<string>" and frame.f_code.co_name == '<module>':
            Sessions.addEvent('script:step', frame.f_lineno)
            gevent.sleep(0)
            script_exec_lock.acquire()
            script_exec_lock.release()


@App.route('/limits/dict')
def handle():
    return json.dumps(limits.getDefaultDict().toJSON())


PromptResponse = None

@App.route('/prompt', method='POST')
def handle():
    global PromptResponse

    prompt_type = bottle.request.json.get('type')
    options = bottle.request.json.get('options')
    timeout = int(bottle.request.json.get('timeout'))

    delay = 0.25
    elapsed = 0
    status = None

    prompt_data = {
        'type': prompt_type,
        'options': options,
    }

    Sessions.addEvent('prompt:init', prompt_data)
    while True:
        if PromptResponse:
            status = PromptResponse
            break

        if timeout > 0 and elapsed >= timeout:
            status = {u'response': u'timeout'}
            Sessions.addEvent('prompt:timeout', None)
            break
        else:
            time.sleep(delay)
            elapsed += delay

    PromptResponse = None
    return bottle.HTTPResponse(status=200, body=json.dumps(status))


@App.route('/prompt/response', method='POST')
def handle():
    global PromptResponse
    with Sessions.current() as session:
        Sessions.addEvent('prompt:done', None)
        PromptResponse = json.loads(bottle.request.body.read())
