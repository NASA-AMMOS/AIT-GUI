import gevent
import gevent.event
import gevent.util
import gevent.lock
import gevent.monkey

gevent.monkey.patch_all()
import geventwebsocket

import bdb
import pickle
import importlib
import json
import os
import struct
import sys
import time
from typing import Dict
import urllib
import webbrowser

import bottle
import pkg_resources

import ait.core
from ait.core import (
    api,
    cmd,
    dtype,
    dmc,
    evr,
    limits,
    log,
    pcap,
    tlm,
    gds,
    util,
)
from ait.core.server.plugin import Plugin
import copy
from datetime import datetime, timedelta


class Session(object):
    """Session
    A Session manages the state for a single GUI client connection.
    Sessions are managed through a SessionStore and may be used as a
    Python context.
    """

    def __init__(self, store=None, maxlen=100):
        """Creates a new Session, capable of storing up to maxlen items of
        each event, message, and telemetry type.
        """
        self.events = api.GeventDeque(maxlen=maxlen)
        self.messages = api.GeventDeque(maxlen=maxlen)
        self.telemetry = api.GeventDeque(maxlen=maxlen)
        self.deltas = api.GeventDeque(maxlen=maxlen)
        self.tlm_counters = {}
        self._maxlen = maxlen
        self._store = store
        self._numConnections = 0

    def __enter__(self):
        """Begins a Session context / connection."""
        self._numConnections += 1
        return self

    def __exit__(self, exc_type, exc_value, traceback):
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
    def id(self):
        """A unique identifier for this Session."""
        return str(id(self))

    def update_counter(self, pkt_name):
        if pkt_name not in self.tlm_counters:
            self.tlm_counters[pkt_name] = 0
        else:
            count = self.tlm_counters[pkt_name]
            count = count + 1 if count < 2**31 - 1 else 0
            self.tlm_counters[pkt_name] = count

        return self.tlm_counters[pkt_name]


packet_defns: Dict[int, tlm.PacketDefinition] = {}


def get_packet_defn(uid):
    """
    Returns packet defn from tlm dict matching uid.
    Logs warning and returns None if no defn matching uid is found.
    """
    global packet_defns

    if uid in packet_defns:
        return packet_defns[uid]

    else:
        tlmdict = ait.core.tlm.getDefaultDict()
        for _k, v in tlmdict.items():
            if v.uid == uid:
                packet_defns[uid] = v
                return v

        log.warn("No packet defn matching UID {}".format(uid))
        return None


class SessionStore(dict):
    """SessionStore
    A SessionStore manages one or more Sessions.  SessionStores
    associate a Session with a GUI clients through an HTTP cookie.
    """

    History = Session(maxlen=600)

    def __init__(self, *args, **kwargs):
        """Creates a new SessionStore."""
        dict.__init__(self, *args, **kwargs)

    def add_telemetry(self, uid, packet):
        """Adds a telemetry packet to all Sessions in the store."""
        item = (uid, packet)
        SessionStore.History.telemetry.append(item)

        pkt_defn = get_packet_defn(uid)
        pkt_name = pkt_defn.name
        delta, dntoeus = get_packet_delta(pkt_defn, packet)
        dntoeus = replace_datetimes(dntoeus)

        for session in self.values():
            counter = session.update_counter(pkt_name)
            item = (pkt_name, delta, dntoeus, counter)
            session.deltas.append(item)
            item = (uid, packet, session.tlm_counters[pkt_name])
            session.telemetry.append(item)

    def add_message(self, msg):
        """Adds a log message to all Sessions in the store."""
        SessionStore.History.messages.append(msg)
        for session in self.values():
            session.messages.append(msg)

    def add_event(self, name, data):
        """Adds an event to all Sessions in the store."""
        event = {"name": name, "data": data}
        SessionStore.History.events.append(event)
        for session in self.values():
            session.events.append(event)

    def current(self):
        """Returns the current Session for this HTTP connection or raise an
        HTTP 401 Unauthorized error.
        """
        session = self.get(bottle.request.get_cookie("sid"))
        if session is None:
            raise bottle.HTTPError(401, "Invalid Session Id")
        return session

    def create(self):
        """Creates and returns a new Session for this HTTP connection."""
        session = Session(self)
        self[session.id] = session
        bottle.response.set_cookie("sid", session.id)
        return session

    def remove(self, session):
        """Removes the given Session from this SessionStore."""
        del self[session.id]


class Playback(object):
    """Playback
    A Playback manages the state for the playback component.
    playback.dbconn: connection to database
    playback.query: time query map of {timestamp: list of (uid, data)} from database
    playback.on: True if gui is currently in playback mode. Real-time telemetry will not
        be sent to the frontend during this.
    playback.enabled: True if historical data playback is enabled. This will be False
        if a database connection cannot be made or if data playback is disabled for
        some other reason.
    """

    def __init__(self):
        """Creates a new Playback"""
        self.enabled = False
        self.query = {}
        self.on = False
        self.dbconn = None

        self._db_connect()

        if self.dbconn:
            self.enabled = True

    def _db_connect(self):
        """Connect to database"""

        # Get datastore from config
        plugins = ait.config.get("server.plugins", [])
        datastore = None
        other_args = {}
        for i in range(len(plugins)):
            if (
                plugins[i]["plugin"]["name"]
                == "ait.core.server.plugins.data_archive.DataArchive"
            ):
                datastore = plugins[i]["plugin"]["datastore"]
                other_args = copy.deepcopy(plugins[i]["plugin"])
                other_args.pop("name")
                other_args.pop("inputs", None)
                other_args.pop("outputs", None)
                other_args.pop("datastore", None)
                break

        if datastore:
            try:
                mod, cls = datastore.rsplit(".", 1)

                # Connect to database
                self.dbconn = getattr(importlib.import_module(mod), cls)()
                self.dbconn.connect(**other_args)
            except Exception as e:
                log.error("Error connecting to datastore {}: {}".format(datastore, e))
                log.warn("Disabling telemetry playback.")
        else:
            msg = (
                "[GUI Playback Configuration]"
                "Unable to locate DataArchive plugin configuration for "
                "historical data queries. Historical telemetry playback "
                "will be disabled in monitoring UI and server endpoints."
            )
            log.warn(msg)

    def reset(self):
        """Reset fields"""
        self.query.clear()
        self.on = False


Sessions = SessionStore()
playback = Playback()

_RUNNING_SCRIPT = None
_RUNNING_SEQ = None
CMD_API = ait.core.api.CmdAPI()


class HTMLRoot:
    Static = User = pkg_resources.resource_filename("ait.gui", "static/")


SEQRoot = ait.config.get("sequence.directory", None)  # type: ignore[attr-defined]
if SEQRoot and not os.path.isdir(SEQRoot):
    msg = "sequence.directory does not exist. Sequence loads may fail."
    ait.core.log.warn(msg)  # type: ignore

ScriptRoot = ait.config.get("script.directory", None)  # type: ignore[attr-defined]
if ScriptRoot and not os.path.isdir(ScriptRoot):
    msg = (
        "script.directory points to a directory that does not exist. "
        "Script loads may fail."
    )
    ait.core.log.warn(msg)  # type: ignore

App = bottle.Bottle()
Servers = []
Greenlets = []  # type: ignore[var-annotated]


try:
    with open(os.path.join(HTMLRoot.Static, "package.json")) as infile:
        package_data = json.loads(infile.read())
    VERSION = "AIT GUI v{}".format(package_data["version"])
    log.info("Running {}".format(VERSION))  # type: ignore
# TODO: Fix this nonsense
except Exception:
    VERSION = ""
    log.warn("Unable to determine which AIT GUI Version is running")  # type: ignore


class AITGUIPlugin(Plugin):
    global playback

    def __init__(self, inputs, outputs, zmq_args=None, **kwargs):
        super(AITGUIPlugin, self).__init__(inputs, outputs, zmq_args, **kwargs)

        try:
            HTMLRoot.User = kwargs["html"]["directory"]
            log.info(
                "[GUI Plugin Configuration] Static file directory is set to {}".format(
                    HTMLRoot.User
                )
            )
        # TODO: Fix this nonsense
        except Exception:
            log.warn(
                "[GUI Plugin Configuration] Unable to locate static file directory in config.yaml. "
                "The directory is set to {}".format(HTMLRoot.User)
            )

        bottle.TEMPLATE_PATH.append(HTMLRoot.User)

        gevent.spawn(self.init)

    def process(self, input_data, topic=None):
        # msg is going to be a tuple from the ait_packet_handler
        # (packet_uid, packet)
        # need to handle log/telem messages differently based on topic
        # Look for topic in list of stream log and telem stream names first.
        # If those lists don't exist or topic not in them, try matching text
        # in topic name.

        processed = False

        if hasattr(self, "log_stream_names"):
            if topic in self.log_stream_names:
                self.process_log_msg(input_data)
                processed = True

        if hasattr(self, "telem_stream_names"):
            if topic in self.telem_stream_names:
                self.process_telem_msg(input_data)
                processed = True

        if not processed:
            if "telem_stream" in topic:
                self.process_telem_msg(input_data)
                processed = True

            elif topic == "log_stream":
                self.process_log_msg(input_data)
                processed = True

        if not processed:
            raise ValueError(
                "Topic of received message not recognized as telem or log stream."
            )

    def process_telem_msg(self, msg):
        msg = pickle.loads(msg)
        if playback.on is False:
            Sessions.add_telemetry(msg[0], msg[1])

    def process_log_msg(self, msg):
        msg = msg.decode()
        parsed = log.parse_syslog(msg)
        Sessions.add_message(parsed)

    def get_browser_name(self, browser):
        return getattr(browser, "name", getattr(browser, "_name", "(none)"))

    def init(self):

        # The /cmd endpoint requires access to the AITGUIPlugin object so it
        # can publish commands via the Plugin interface. It's defined here with
        # the static file routes so that things are grouped semi-neatly.
        @App.route("/cmd", method="POST")
        def handle_cmd():
            """Send a given command
            :formparam command: The command that should be sent. If arguments
                                are to be included they should be separated via
                                whitespace.
            **Example command format**
            .. sourcecode:
               myExampleCommand argumentOne argumentTwo
            """
            with Sessions.current() as session:  # noqa: F841
                command = bottle.request.forms.get("command").strip()

                args = command.split()
                if args:
                    name = args[0].upper()
                    args = [util.toNumber(t, t) for t in args[1:]]

                    if self.send(name, *args):
                        Sessions.add_event("cmd:hist", command)
                        bottle.response.status = 200
                    else:
                        bottle.response.status = 400
                else:
                    bottle.response.status = 400

        @App.route("/ait/gui/static/<pathname:path>")
        def handle_static_files(pathname):
            return bottle.static_file(pathname, root=HTMLRoot.Static)

        @App.route("/<pathname:path>")
        def handle_root_files(pathname):
            return bottle.static_file(pathname, root=HTMLRoot.User)

        port = int(getattr(self, "port", 8080))
        host = getattr(self, "host", "localhost")  # noqa: F841

        Servers.append(
            gevent.pywsgi.WSGIServer(
                ("0.0.0.0", port),
                App,
                handler_class=geventwebsocket.handler.WebSocketHandler,
            )
        )

        for s in Servers:
            s.start()

    def cleanup(self):
        global Servers

        for s in Servers:
            s.stop()

        gevent.killall(Greenlets)

    def start_browser(self, url, name=None):
        browser = None

        if name is not None and name.lower() == "none":
            log.info("Will not start any browser since --browser=none")
            return

        try:
            browser = webbrowser.get(name)
        except webbrowser.Error:
            msg = "Could not find browser: %s.  Will use: %s."
            browser = webbrowser.get()
            log.warn(msg, name, self.get_browser_name(browser))

        if type(browser) is webbrowser.GenericBrowser:
            msg = "Will not start text-based browser: %s."
            log.info(msg % self.get_browser_name(browser))
        elif browser is not None:
            log.info("Starting browser: %s" % self.get_browser_name(browser))
            browser.open_new(url)

    def wait(self):
        if len(Greenlets) > 0:
            done = gevent.joinall(Greenlets, raise_error=True, count=1)
            for d in done:
                if issubclass(type(d.value), KeyboardInterrupt):
                    raise d.value
        else:
            gevent.wait()

    def send(self, command, *args, **kwargs):
        """Creates, validates, and sends the given command as a UDP
        packet to the destination (host, port) specified when this
        CmdAPI was created.
        Returns True if the command was created, valid, and sent,
        False otherwise.
        """
        status = False
        cmdobj = CMD_API._cmddict.create(command, *args, **kwargs)
        messages = []

        if not cmdobj.validate(messages):
            for msg in messages:
                log.error(msg)
        else:
            encoded = cmdobj.encode()

            if CMD_API._verbose:
                size = len(cmdobj.name)
                pad = (size - len(cmdobj.name) + 1) * " "
                gds.hexdump(encoded, preamble=cmdobj.name + ":" + pad)

            try:
                self.publish(encoded)
                status = True

                with pcap.open(CMD_API.CMD_HIST_FILE, "a") as output:
                    output.write(str(cmdobj))
            except IOError as e:
                log.error(e.message)

        return status


def __set_response_to_event_stream():
    bottle.response.content_type = "text/event-stream"
    bottle.response.cache_control = "no-cache"


def __set_response_to_json():
    bottle.response.content_type = "application/json"
    bottle.response.cache_control = "no-cache"


@App.route("/")
def handle_root():
    """Return index page"""
    Sessions.create()
    return bottle.template("index.html", version=VERSION)


@App.route("/events", method="GET")
def handle_events_get():
    """Endpoint that pushes Server-Sent Events to client"""
    with Sessions.current() as session:
        __set_response_to_event_stream()
        yield "event: connected\ndata:\n\n"

        while True:
            try:
                event = session.events.popleft(timeout=30)
                __set_response_to_event_stream()
                yield "data: %s\n\n" % json.dumps(event)
            except IndexError:
                yield "event: probe\ndata:\n\n"


@App.route("/events", method="POST")
def handle_events_post():
    """Add an event to the event stream
    :jsonparam name: The name of the event to add.
    :jsonparam data: The data to include with the event.
    """
    with Sessions.current() as session:  # noqa: F841
        name = bottle.request.POST.name
        data = bottle.request.POST.data
        Sessions.add_event(name, data)


@App.route("/evr/dict", method="GET")
def handle_evr_get():
    """Return JSON EVR dictionary"""
    return json.dumps(evr.getDefaultDict().toJSON())


@App.route("/messages", method="POST")
def handle_messages_post():
    """Log a message via core library logging utilities
    :jsonparam severity: The log message severity
    :jsonparam message: The message to be sent
    """
    severity = bottle.request.json.get("severity")
    message = bottle.request.json.get("message")

    logger = getattr(log, severity, log.info)
    logger(message)


@App.route("/messages", method="GET")
def handle_messages_get():
    """Endpoint that pushes syslog output to client"""
    with Sessions.current() as session:
        __set_response_to_event_stream()
        yield "event: connected\ndata:\n\n"

        while True:
            try:
                msg = session.messages.popleft(timeout=30)
                __set_response_to_event_stream()
                yield "data: %s\n\n" % json.dumps(msg)
            except IndexError:
                yield "event: probe\ndata:\n\n"


@App.route("/tlm/dict", method="GET")
def handle_tlm_get():
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
    return json.dumps(tlm.getDefaultDict().toJSON())


@App.route("/cmd/dict", method="GET")
def handle_cmd_get():
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
    return json.dumps(cmd.getDefaultDict().toJSON())


@App.route("/cmd/hist.json", method="GET")
def handle_cmd_hist_get():
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
        with pcap.open(CMD_API.CMD_HIST_FILE, "r") as stream:
            if "detailed" in bottle.request.query:
                cmds = [
                    {
                        "timestamp": str(header.timestamp),
                        "command": cmdname.decode("utf-8"),
                    }
                    for (header, cmdname) in stream
                ]
                return json.dumps(list(reversed(cmds)))
            else:
                cmds = [cmdname.decode("utf-8") for (header, cmdname) in stream]
                return json.dumps(list(set(cmds)))
    except IOError:
        pass


@App.route("/cmd/validate", method="POST")
def handle_cmd_val_post():
    """"""
    command = bottle.request.forms.get("command").strip()

    args = command.split()
    name = args[0].upper()
    args = [util.toNumber(t, t) for t in args[1:]]
    valid, msgs = CMD_API.validate(name, *args)

    if valid:
        bottle.response.status = 200
        validation_status = "{} Passed Ground Verification".format(command)
        log.info("Command Validation: {}".format(validation_status))
    else:
        bottle.response.status = 400
        validation_status = "{} Command Failed Ground Verification".format(command)

    bottle.response.content_type = "application/json"
    return json.dumps({"msgs": [str(m) for m in msgs], "status": validation_status})


@App.route("/log", method="GET")
def handle_log_get():
    """Endpoint that pushes syslog output to client"""
    with Sessions.current() as session:
        __set_response_to_event_stream()
        yield "event: connected\ndata:\n\n"

        while True:
            msg = session.messages.popleft()
            __set_response_to_event_stream()
            yield "data: %s\n\n" % json.dumps(msg)


@App.route("/tlm/realtime/openmct")
def handle_openmct_realtime_tlm():
    """Return telemetry packets in realtime to client"""
    session = Sessions.create()
    pad = bytearray(1)
    wsock = bottle.request.environ.get("wsgi.websocket")

    if not wsock:
        bottle.abort(400, "Expected WebSocket request.")

    try:
        while not wsock.closed:
            try:
                uid, data = session.telemetry.popleft(timeout=30)
                pkt_defn = get_packet_defn(uid)

                wsock.send(
                    json.dumps(
                        {
                            "packet": pkt_defn.name,
                            "data": ait.core.tlm.Packet(pkt_defn, data=data).toJSON(),
                        }
                    )
                )

            except IndexError:
                # If no telemetry has been received by the GUI
                # server after timeout seconds, "probe" the client
                # websocket connection to make sure it's still
                # active and if so, keep it alive.  This is
                # accomplished by sending a packet with an ID of
                # zero and no packet data.  Packet ID zero with no
                # data is ignored by AIT GUI client-side
                # Javascript code.

                if not wsock.closed:
                    wsock.send(pad + struct.pack(">I", 0))
    except geventwebsocket.WebSocketError:
        pass


packet_states = {}


def get_packet_delta(pkt_defn, packet):
    """
    Keeps track of last packets recieved of all types recieved
    and returns only fields that have changed since last packet.

    Params:
        pkt_defn:  Packet definition
        packet:    Binary packet data
    Returns:
        delta:     JSON of packet fields that have changed
    """
    ait_pkt = ait.core.tlm.Packet(pkt_defn, data=packet)

    # first packet of this type
    if pkt_defn.name not in packet_states:
        packet_states[pkt_defn.name] = {}

        # get raw fields
        raw_fields = {f.name: getattr(ait_pkt.raw, f.name) for f in pkt_defn.fields}
        packet_states[pkt_defn.name]["raw"] = raw_fields
        delta = raw_fields

        # get converted fields / complex fields
        packet_states[pkt_defn.name]["dntoeu"] = {}
        dntoeus = {}
        for f in pkt_defn.fields:
            if (
                f.dntoeu is not None
                or f.enum is not None
                or f.type.name in dtype.ComplexTypeMap.keys()
            ):
                try:
                    val = getattr(ait_pkt, f.name)
                except ValueError:
                    if isinstance(f.type, dtype.CmdType):
                        val = "Unidentified Cmd"
                    else:
                        val = getattr(ait_pkt.raw, f.name)

                if isinstance(val, cmd.CmdDefn) or isinstance(val, evr.EVRDefn):
                    val = val.name

                dntoeus[f.name] = val
                packet_states[pkt_defn.name]["dntoeu"][f.name] = val

        # get derivations
        packet_states[pkt_defn.name]["raw"].update(
            {f.name: getattr(ait_pkt.raw, f.name) for f in pkt_defn.derivations}
        )
        delta.update(
            {f.name: getattr(ait_pkt.raw, f.name) for f in pkt_defn.derivations}
        )

    # previous packets of this type received
    else:
        delta, dntoeus = {}, {}

        for field in pkt_defn.fields:
            new_raw = getattr(ait_pkt.raw, field.name)
            last_raw = packet_states[pkt_defn.name]["raw"][field.name]

            # A field update needs sent when the raw value has changed or if a
            # DN to EU is defined on the field. DN to EUs can take multiple
            # telemetry points as input or may rely on other means to determine
            # a value. We can't be sure that they won't change so we should
            # always calculate them.
            if new_raw != last_raw or field.dntoeu is not None:
                delta[field.name] = new_raw
                packet_states[pkt_defn.name]["raw"][field.name] = new_raw

                if (
                    field.dntoeu is not None
                    or field.enum is not None
                    or field.type.name in dtype.ComplexTypeMap.keys()
                ):
                    try:
                        dntoeu_val = getattr(ait_pkt, field.name)
                    except ValueError:
                        if isinstance(field.type, dtype.CmdType):
                            dntoeu_val = "Unidentified Cmd"
                        else:
                            dntoeu_val = getattr(ait_pkt.raw, field.name)

                    if isinstance(dntoeu_val, cmd.CmdDefn) or isinstance(
                        dntoeu_val, evr.EVRDefn
                    ):
                        dntoeu_val = dntoeu_val.name

                    dntoeus[field.name] = dntoeu_val
                    packet_states[pkt_defn.name]["dntoeu"][field.name] = dntoeu_val

        for field in pkt_defn.derivations:
            new_value = getattr(ait_pkt.raw, field.name)
            last_value = packet_states[pkt_defn.name]["raw"][field.name]

            if new_value != last_value:
                delta[field.name] = new_value
                packet_states[pkt_defn.name]["raw"][field.name] = new_value

    return delta, dntoeus


def replace_datetimes(delta):
    """Replace datetime objects with ISO formatted
    strings for JSON serialization"""
    for key, val in delta.items():
        if type(val) is datetime:
            delta[key] = val.isoformat()

    return delta


@App.route("/tlm/realtime")
def handle_tlm_realtime():
    """Return telemetry packets in realtime to client"""
    with Sessions.current() as session:
        # A null-byte pad ensures wsock is treated as binary.
        pad = bytearray(1)
        wsock = bottle.request.environ.get("wsgi.websocket")

        if not wsock:
            bottle.abort(400, "Expected WebSocket request.")

        try:
            while not wsock.closed:
                try:
                    name, delta, dntoeus, counter = session.deltas.popleft(timeout=30)

                    wsock.send(
                        json.dumps(
                            {
                                "packet": name,
                                "data": delta,
                                "dntoeus": dntoeus,
                                "counter": counter,
                            }
                        )
                    )

                except IndexError:
                    # If no telemetry has been received by the GUI
                    # server after timeout seconds, "probe" the client
                    # websocket connection to make sure it's still
                    # active and if so, keep it alive.  This is
                    # accomplished by sending a packet with an ID of
                    # zero and no packet data.  Packet ID zero with no
                    # data is ignored by AIT GUI client-side
                    # Javascript code.

                    if not wsock.closed:
                        wsock.send(pad + struct.pack(">I", 0))
        except geventwebsocket.WebSocketError:
            pass


@App.route("/tlm/latest", method="GET")
def handle_tlm_latest():
    """Return latest telemetry packet to client"""
    for pkt_type, state in packet_states.items():
        packet_states[pkt_type]["dntoeu"] = replace_datetimes(state["dntoeu"])

    with Sessions.current() as session:
        counters = session.tlm_counters
        return json.dumps({"states": packet_states, "counters": counters})


@App.route("/tlm/query", method="POST")
def handle_tlm_query_post():
    """"""
    _fields_file_path = os.path.join(HTMLRoot.Static, "fields_in.txt")

    data_dir = bottle.request.forms.get("dataDir")
    time_field = bottle.request.forms.get("timeField")
    packet = bottle.request.forms.get("packet")
    fields = bottle.request.forms.get("fields").split(",")
    start_time = bottle.request.forms.get("startTime")
    end_time = bottle.request.forms.get("endTime")

    if not (time_field and packet and fields and start_time):
        bottle.abort(400, "Malformed parameters")

    with open(_fields_file_path, "w") as fields_file:
        for f in fields:
            fields_file.write(f + "\n")

    pcaps = []
    for d, _dirs, files in os.walk(data_dir):
        for f in files:
            if f.endswith(".pcap"):
                pcaps.append(os.path.join(d, f))

    if len(pcaps) == 0:
        msg = "Unable to locate PCAP files for query given data directory {}".format(
            data_dir
        )
        log.error(msg)
        bottle.abort(400, msg)

    tlm_query_proc = gevent.subprocess.call(  # noqa: F841
        [
            "ait-tlm-csv",
            "--time_field",
            time_field,
            "--fields",
            _fields_file_path,
            "--stime",
            start_time,
            "--etime",
            end_time,
            "--packet",
            packet,
            "--csv",
            os.path.join(HTMLRoot.Static, "query_out.csv"),
        ]
        + ["{}".format(p) for p in pcaps]
    )

    os.remove(_fields_file_path)

    return bottle.static_file(
        "query_out.csv", root=HTMLRoot.Static, mimetype="application/octet-stream"
    )


@App.route("/data", method="GET")
def handle_data_get():
    """Expose ait.config.data info to the frontend"""
    return json.dumps(ait.config._datapaths)


@App.route("/leapseconds", method="GET")
def handle_leapseconds_get():
    """Return UTC-GPS Leapsecond data
    **Example Response**:
    .. sourcecode: json
       [
           ["1981-07-01 00:00:00", 1],
           ["1982-07-01 00:00:00", 2],
           ["1983-07-01 00:00:00", 3]
       ]
    """
    return json.dumps(dmc.LeapSeconds.leapseconds, default=str)


@App.route("/seq", method="GET")
def handle_seq_get():
    """Return a JSON array of filenames in the SEQRoot directory
    **Example Response**:
    .. sourcecode: json
       [
            sequenceOne.txt,
            sequenceTwo.txt
       ]
    """
    if SEQRoot is None:
        files = []
    else:
        files = util.listAllFiles(SEQRoot, ".txt")

        return json.dumps(sorted(files))


@App.route("/seq", method="POST")
def handle_seq_post():
    """Run requested sequence file
    :formparam seqfile: The sequence filename located in SEQRoot to execute
    """
    global _RUNNING_SEQ

    with Sessions.current() as session:  # noqa: F841
        bn_seqfile = bottle.request.forms.get("seqfile")
        _RUNNING_SEQ = gevent.spawn(bg_exec_seq, bn_seqfile)


@App.route("/seq/abort", method="POST")
def handle_seq_abort():
    """Abort the active running sequence"""
    global _RUNNING_SEQ

    with Sessions.current() as session:  # noqa: F841
        if _RUNNING_SEQ:
            _RUNNING_SEQ.kill()
            _RUNNING_SEQ = None
            log.info("Sequence aborted by user")
            Sessions.add_event("seq:err", "Sequence aborted by user")


def bg_exec_seq(bn_seqfile):
    seqfile = os.path.join(SEQRoot, bn_seqfile)
    if not os.path.isfile(seqfile):
        msg = "Sequence file not found.  "
        msg += "Reload page to see updated list of files."
        log.error(msg)
        return

    log.info("Executing sequence: " + seqfile)
    Sessions.add_event("seq:exec", bn_seqfile)
    try:
        seq_p = gevent.subprocess.Popen(
            ["ait-seq-send", seqfile], stdout=gevent.subprocess.PIPE
        )
        seq_out, seq_err = seq_p.communicate()
        if seq_p.returncode != 0:
            if not seq_err:
                seq_err = "Unknown Error"
            Sessions.add_event("seq:err", bn_seqfile + ": " + seq_err)
            return

        Sessions.add_event("seq:done", bn_seqfile)
    except gevent.GreenletExit:
        seq_p.kill()


script_exec_lock = gevent.lock.Semaphore(1)


@App.route("/scripts", method="GET")
def handle_scripts_get():
    """Return a JSON array of script filenames
    Scripts are located via the script.directory configuration parameter.
    """
    with Sessions.current() as session:  # noqa: F841
        if ScriptRoot is None:
            files = []
        else:
            files = util.listAllFiles(ScriptRoot, ".py")

        return json.dumps(sorted(files))


@App.route("/scripts/load/<name>", method="GET")
def handle_scripts_load(name):
    """Return the text of a script
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
    with Sessions.current() as session:  # noqa: F841
        script_path = os.path.join(ScriptRoot, urllib.parse.unquote(name))
        if not os.path.exists(script_path):
            bottle.abort(400, "Script cannot be located")

        with open(script_path) as infile:
            script_text = infile.read()

        return json.dumps({"script_text": script_text})


@App.route("/script/run", method="POST")
def handle_script_run_post():
    """Run a script
    Scripts are located via the script.directory configuration parameter.
    :formparam scriptPath: The name of the script to load. This should be one
                           of the values returned by **/scripts**.
    :statuscode 400: When the script name cannot be located
    """
    global _RUNNING_SCRIPT

    if _RUNNING_SCRIPT is None:
        with Sessions.current() as session:  # noqa: F841
            script_name = bottle.request.forms.get("scriptPath")
            script_path = os.path.join(ScriptRoot, script_name)

            if not os.path.exists(script_path):
                bottle.abort(400, "Script cannot be located")

            _RUNNING_SCRIPT = gevent.spawn(bg_exec_script, script_path)
    else:
        msg = (
            "Attempted to execute script while another script is running. "
            "Please wait until the previous script completes and try again"
        )
        log.warn(msg)


@App.route("/script/run", method="PUT")
def handle_script_run_put():
    """Resume a paused script"""
    with Sessions.current() as session:  # noqa: F841
        script_exec_lock.release()
        Sessions.add_event("script:resume", None)


@App.route("/script/pause", method="PUT")
def handle_script_pause_put():
    """Pause a running script"""
    with Sessions.current() as session:  # noqa: F841
        script_exec_lock.acquire()
        Sessions.add_event("script:pause", None)


@App.route("/script/step", method="PUT")
def handle_script_step_put():
    """Step a paused script"""
    with Sessions.current() as session:  # noqa: F841
        script_exec_lock.release()
        gevent.sleep(0)
        script_exec_lock.acquire()


@App.route("/script/abort", method="DELETE")
def handle_script_abort_delete():
    """Abort a running script"""
    if not script_exec_lock.locked():
        script_exec_lock.acquire()

    if _RUNNING_SCRIPT:
        _RUNNING_SCRIPT.kill(UIAbortException())
    script_exec_lock.release()
    Sessions.add_event("script:aborted", None)


def bg_exec_script(script_path):
    global _RUNNING_SCRIPT

    debugger = AitDB()
    with open(script_path) as infile:
        script = infile.read()

    Sessions.add_event("script:start", None)
    try:
        debugger.run(script)
        Sessions.add_event("script:done", None)
    except Exception as e:
        ait.core.log.error(
            "Script execution error: {}: {}".format(sys.exc_info()[0].__name__, e)
        )
        Sessions.add_event("script:error", str(e))
    finally:
        _RUNNING_SCRIPT = None


class AitDB(bdb.Bdb):
    def user_line(self, frame):
        fn = self.canonic(frame.f_code.co_filename)
        # When executing our script the code location will be
        # denoted as "<string>" since we're passing the script
        # to the debugger as such. If we don't check for this we'll
        # end up with a bunch of execution noise (specifically gevent
        # function calls). We also only want to report line changes
        # in the current script. A check that the `co_name` is
        # '<module>' ensures this.
        if fn == "<string>" and frame.f_code.co_name == "<module>":
            Sessions.add_event("script:step", frame.f_lineno)
            gevent.sleep(0)
            script_exec_lock.acquire()
            script_exec_lock.release()


@App.route("/limits/dict")
def handle_limits_get():
    return json.dumps(limits.getDefaultDict().toJSON())


PromptResponse = None


@App.route("/prompt", method="POST")
def handle_prompt_post():
    global PromptResponse

    prompt_type = bottle.request.json.get("type")
    options = bottle.request.json.get("options")
    timeout = int(bottle.request.json.get("timeout"))

    delay = 0.25
    elapsed = 0
    status = None

    prompt_data = {
        "type": prompt_type,
        "options": options,
    }

    Sessions.add_event("prompt:init", prompt_data)
    while True:
        if PromptResponse:
            status = PromptResponse
            break

        if timeout > 0 and elapsed >= timeout:
            status = {"response": "timeout"}
            Sessions.add_event("prompt:timeout", None)
            break
        else:
            time.sleep(delay)
            elapsed += delay

    PromptResponse = None
    return bottle.HTTPResponse(status=200, body=json.dumps(status))


@App.route("/prompt/response", method="POST")
def handle_prompt_response_post():
    global PromptResponse
    with Sessions.current() as session:  # noqa: F841
        Sessions.add_event("prompt:done", None)
        PromptResponse = json.loads(bottle.request.body.read())


@App.route("/playback/range", method="GET")
def handle_playback_range_get():
    """Return a JSON array of [packet_name, start_time, end_time] to represent the time range
    of each packet in the database
        **Example Response**:
        .. sourcecode: json
            [
                ["1553_HS_Packet", "2019-07-15T18:10:00.0", "2019-07-15T18:12:00.0"],
                ["Ethernet_HS_Packet", "2019-07-15T19:25:16.0", "2019-07-15T19:28:50.0"],
            ]
    """
    global playback
    ranges = []

    if not playback.enabled:
        return json.dumps([])

    # Loop through each packet from database
    packets = list(playback.dbconn.query("SHOW MEASUREMENTS").get_points())
    for i in range(len(packets)):

        # Add packet name
        packet_name = packets[i]["name"]
        ranges.append([packet_name])

        # Add start time and end time
        point_query = 'SELECT * FROM "{}"'.format(packet_name)
        points = list(playback.dbconn.query(point_query).get_points())

        # Round start time down to nearest second
        start_time_str = points[0]["time"].split(".")[0]

        if start_time_str[-1] != "Z":
            start_time = start_time_str + "Z"
        else:
            start_time = start_time_str

        ranges[i].append(start_time)

        # Round end time up to nearest second
        end_time_str = points[-1]["time"].split(".")[0]

        if end_time_str[-1] == "Z":
            end_time = datetime.strptime(
                end_time_str, "%Y-%m-%dT%H:%M:%SZ"
            ) + timedelta(seconds=1)
        else:
            end_time = datetime.strptime(end_time_str, "%Y-%m-%dT%H:%M:%S") + timedelta(
                seconds=1
            )

        ranges[i].append(end_time.strftime("%Y-%m-%dT%H:%M:%SZ"))

    return json.dumps(ranges)


@App.route("/playback/query", method="POST")
def handle_playback_query_post():
    """Set playback query with packet name, start time, and end time from form"""
    global playback

    if not playback.enabled:
        return HttpResponse(status=404, body="Historic data playback is disabled")  # noqa: F821

    tlm_dict = tlm.getDefaultDict()

    # Get values from form
    packet = bottle.request.forms.get("packet")
    start_time = bottle.request.forms.get("startTime")
    end_time = bottle.request.forms.get("endTime")
    uid = tlm_dict[packet].uid

    # Query packet and time range from database
    point_query = "SELECT * FROM \"{}\" WHERE time >= '{}' AND time <= '{}'".format(
        packet, start_time, end_time
    )
    points = list(playback.dbconn.query(point_query).get_points())

    pkt = tlm_dict[packet]
    fields = pkt.fields
    # Build field names list from tlm dictionary for sorting data query
    field_names = []
    # Build field types list from tlm dictionary for packing data
    field_formats = []
    for i in range(len(fields)):
        field_names.append(fields[i].name)
        field_type = str(fields[i].type).split("'")[1]
        field_formats.append(dtype.get(field_type).format)
    # Put query into a map of {timestamp: list of (uid, data)}
    for i in range(len(points)):
        # Round time down to nearest 0.1 second
        timestamp = str(points[i]["time"][:21] + "Z")
        data = b""
        for j in range(len(field_names)):
            data += struct.pack(field_formats[j], points[i][field_names[j]])
        if timestamp in playback.query:
            playback.query[timestamp].append((uid, data))
        else:
            playback.query[timestamp] = [(uid, data)]


@App.route("/playback/on", method="PUT")
def handle_playback_on_put():
    """Indicate that playback is on"""
    global playback
    playback.on = True


@App.route("/playback/send", method="POST")
def handle_playback_send_post():
    """Send timestamp to be put into playback queue if in database"""
    global playback
    timestamp = bottle.request.forms.get("timestamp")

    if timestamp in playback.query:
        query_list = playback.query[timestamp]
        for i in range(len(query_list)):
            Sessions.add_telemetry(query_list[i][0], query_list[i][1])


@App.route("/playback/abort", method="PUT")
def handle_playback_abort_put():
    """Abort playback and return to realtime"""
    global playback

    # Clear playback
    playback.reset()
    # Clear realtime telemetry received while in playback
    with Sessions.current() as session:
        session.telemetry.clear()


class UIAbortException(Exception):
    """Raised when user aborts script execution via GUI controls"""

    def __init__(self, msg=None):
        self._msg = msg

    def __str__(self):
        return self.msg

    @property
    def msg(self):
        s = "UIAbortException: User aborted script execution via GUI controls."

        if self._msg:
            s += ": " + self._msg

        return s
