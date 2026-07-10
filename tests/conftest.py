"""Pytest configuration and fixtures for AIT-GUI.

The security regression tests in this directory import the *real* ``ait.gui``
module and exercise its actual Bottle app, routes, and request hooks.

In a normal development / CI environment ``ait-core`` is installed and the
module imports against the real telemetry backend. When ``ait-core`` is not
importable (for example while running on a Python version that ``ait-core``
does not yet provide wheels for), the fixture below installs minimal
stand-ins for the ``ait.core`` telemetry backend so that the security-relevant
code paths -- the CSRF hook and the script/sequence path-confinement -- can
still be exercised. None of those code paths depend on the telemetry backend,
so stubbing it does not weaken the tests.

The stubs are only installed when the real package is absent; when ``ait-core``
is present it always takes precedence.
"""
import collections
import importlib.resources  # noqa: F401  (ensure submodule is registered)
import os
import sys
import types


def _install_ait_core_stubs():
    # Prefer the real package whenever it is importable.
    try:
        import ait.core  # noqa: F401
        import ait.config  # noqa: F401
        return
    except Exception:
        pass

    # Make sure the repo's `ait` namespace package (and therefore ait.gui) is
    # importable.
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if repo_root not in sys.path:
        sys.path.insert(0, repo_root)

    import ait  # real PEP-420 namespace package from the repo

    def _module(name):
        mod = types.ModuleType(name)
        sys.modules[name] = mod
        return mod

    # --- ait.config -------------------------------------------------------
    config = _module("ait.config")
    config._datapaths = {}
    config.data = {}
    config.get = lambda key, default=None: default
    ait.config = config

    # --- ait.core ---------------------------------------------------------
    core = _module("ait.core")
    ait.core = core

    api = _module("ait.core.api")

    class GeventDeque(collections.deque):
        def __init__(self, *args, maxlen=None, **kwargs):
            super().__init__(maxlen=maxlen)

    class CmdAPI:
        def __init__(self, *args, **kwargs):
            pass

        def send(self, *args, **kwargs):
            return True

    api.GeventDeque = GeventDeque
    api.CmdAPI = CmdAPI
    core.api = api

    log = _module("ait.core.log")
    for _level in ("debug", "info", "warn", "warning", "error"):
        setattr(log, _level, lambda *a, **k: None)
    core.log = log

    tlm = _module("ait.core.tlm")

    class PacketDefinition:  # referenced in a module-level annotation
        pass

    class Packet:
        def __init__(self, *args, **kwargs):
            pass

        def toJSON(self):
            return {}

    tlm.PacketDefinition = PacketDefinition
    tlm.Packet = Packet
    tlm.getDefaultDict = lambda: {}
    core.tlm = tlm

    util = _module("ait.core.util")

    def _to_number(value, default=None):
        try:
            return int(value)
        except (TypeError, ValueError):
            try:
                return float(value)
            except (TypeError, ValueError):
                return default

    util.toNumber = _to_number
    util.listAllFiles = lambda root, ext=None, **k: []
    core.util = util

    dmc = _module("ait.core.dmc")

    class _LeapSeconds:
        leapseconds = {}

    dmc.LeapSeconds = _LeapSeconds
    core.dmc = dmc

    for _sub in ("cmd", "dtype", "evr", "limits", "pcap", "gds"):
        setattr(core, _sub, _module("ait.core.{}".format(_sub)))

    # --- ait.core.server.plugin.Plugin -----------------------------------
    server = _module("ait.core.server")
    plugin = _module("ait.core.server.plugin")

    class Plugin:
        def __init__(self, *args, **kwargs):
            pass

    plugin.Plugin = Plugin
    server.plugin = plugin
    core.server = server


_install_ait_core_stubs()
