"""Security regression tests for the AIT-GUI web API.

These tests exercise the real ``ait.gui`` module (its actual Bottle ``App``,
routes, and ``before_request`` hook) and cover the three fixes made for the
GHSA-p9r8-2q67-fp86 advisory:

  1. CSRF: state-changing endpoints reject cross-origin browser requests.
  2. Path traversal: ``/script/run`` and ``/seq`` confine user-supplied paths
     to their configured roots.
  3. Bind host: the server binds the configured host, not a hard-coded
     ``0.0.0.0``.

The endpoints are driven through the WSGI interface so the request pipeline
(including the ``before_request`` hook) runs exactly as it does in production.
"""
import io
import os
import re

import bottle
import pytest

import ait.gui as gui


HOST = "127.0.0.1:8080"
SAME_ORIGIN = "http://127.0.0.1:8080"
CROSS_ORIGIN = "http://evil.example"


# --------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------
def call(method, path, headers=None, body=b"", cookies=None):
    """Invoke the real ait.gui.App as a WSGI app; return (status_code, body)."""
    if isinstance(body, str):
        body = body.encode()
    environ = {
        "REQUEST_METHOD": method,
        "PATH_INFO": path,
        "QUERY_STRING": "",
        "SERVER_NAME": "127.0.0.1",
        "SERVER_PORT": "8080",
        "HTTP_HOST": HOST,
        "SERVER_PROTOCOL": "HTTP/1.1",
        "CONTENT_TYPE": "application/x-www-form-urlencoded",
        "CONTENT_LENGTH": str(len(body)),
        "wsgi.version": (1, 0),
        "wsgi.url_scheme": "http",
        "wsgi.input": io.BytesIO(body),
        "wsgi.errors": io.StringIO(),
        "wsgi.multithread": False,
        "wsgi.multiprocess": False,
        "wsgi.run_once": False,
    }
    for name, value in (headers or {}).items():
        environ["HTTP_" + name.upper().replace("-", "_")] = value
    if cookies:
        environ["HTTP_COOKIE"] = "; ".join("%s=%s" % kv for kv in cookies.items())

    captured = {}

    def start_response(status, response_headers, exc_info=None):
        captured["status"] = status

    chunks = gui.App(environ, start_response)
    payload = b"".join(chunks).decode("utf-8", "replace")
    return int(captured["status"].split()[0]), payload


@pytest.fixture
def valid_session():
    """Register a Session and return the cookie needed to pass Sessions.current()."""
    session = gui.Session(gui.Sessions)
    gui.Sessions[session.id] = session
    yield {"sid": session.id}
    gui.Sessions.pop(session.id, None)


@pytest.fixture
def script_root(tmp_path, monkeypatch):
    """ScriptRoot is a subdir with one legit script; a real secret sits OUTSIDE it.

    Returns (root, outside_relpath, spawned) where ``outside_relpath`` is a
    traversal string that reaches a file that genuinely exists outside the root
    -- so unconfined code would schedule it and the test fails without the fix.
    """
    root = tmp_path / "scripts"
    root.mkdir()
    (root / "legit.py").write_text("print('ok')\n")
    (tmp_path / "outside.py").write_text("print('pwned')\n")  # real out-of-root file

    monkeypatch.setattr(gui, "ScriptRoot", str(root))
    monkeypatch.setattr(gui, "_RUNNING_SCRIPT", None, raising=False)

    spawned = []
    monkeypatch.setattr(gui.gevent, "spawn", lambda fn, *a, **k: spawned.append(a) or "greenlet")
    return root, "../outside.py", spawned


# --------------------------------------------------------------------------
# 1. CSRF: cross-origin state-changing requests are rejected
# --------------------------------------------------------------------------
def test_csrf_hook_is_registered():
    assert gui.App._hooks.get("before_request"), "before_request hook must be installed"


@pytest.mark.parametrize("method", ["POST", "PUT", "DELETE", "PATCH"])
def test_cross_origin_state_change_blocked(method):
    status, body = call(method, "/seq", headers={"Origin": CROSS_ORIGIN})
    assert status == 403
    assert "Cross-origin" in body


def test_cross_origin_via_referer_blocked():
    status, _ = call("POST", "/seq", headers={"Referer": CROSS_ORIGIN + "/lure.html"})
    assert status == 403


@pytest.fixture
def block_spawn(monkeypatch):
    """Prevent the /seq route from launching a real background greenlet."""
    monkeypatch.setattr(gui.gevent, "spawn", lambda fn, *a, **k: "greenlet")


def test_same_origin_state_change_not_blocked_by_csrf(valid_session, block_spawn):
    # Same-origin: the CSRF hook must not reject it (a missing seqfile is fine;
    # what matters is that we do NOT get a 403 from the hook).
    status, _ = call(
        "POST", "/seq",
        headers={"Origin": SAME_ORIGIN},
        body="seqfile=legit.txt",
        cookies=valid_session,
    )
    assert status != 403


def test_no_origin_header_allowed(valid_session, block_spawn):
    # Non-browser clients (curl/CLI) send neither Origin nor Referer.
    status, _ = call("POST", "/seq", body="seqfile=legit.txt", cookies=valid_session)
    assert status != 403


def test_get_requests_never_blocked():
    status, _ = call("GET", "/seq", headers={"Origin": CROSS_ORIGIN})
    assert status != 403


# --------------------------------------------------------------------------
# 2a. Path traversal: /script/run confines scriptPath to ScriptRoot
# --------------------------------------------------------------------------
def test_script_run_accepts_legit_path(script_root, valid_session):
    _, _, spawned = script_root
    status, _ = call(
        "POST", "/script/run",
        headers={"Origin": SAME_ORIGIN},
        body="scriptPath=legit.py",
        cookies=valid_session,
    )
    assert status == 200
    assert len(spawned) == 1  # runner was scheduled for the in-root script


def test_script_run_rejects_traversal_to_real_file(script_root, valid_session):
    """A traversal to a file that really exists outside ScriptRoot is refused."""
    _, outside_rel, spawned = script_root
    status, _ = call(
        "POST", "/script/run",
        headers={"Origin": SAME_ORIGIN},
        body="scriptPath=" + outside_rel,
        cookies=valid_session,
    )
    assert status == 400
    assert spawned == []  # the out-of-root script was never scheduled


@pytest.mark.parametrize("evil", ["../../../../etc/passwd", "..%2f..%2f..%2fpasswd"])
def test_script_run_rejects_traversal_patterns(script_root, valid_session, evil):
    _, _, spawned = script_root
    status, _ = call(
        "POST", "/script/run",
        headers={"Origin": SAME_ORIGIN},
        body="scriptPath=" + evil,
        cookies=valid_session,
    )
    assert status == 400
    assert spawned == []


# --------------------------------------------------------------------------
# 2b. Path traversal: /seq confines seqfile to SEQRoot before Popen
# --------------------------------------------------------------------------
@pytest.fixture
def seq_root(tmp_path, monkeypatch):
    """SEQRoot subdir with a legit sequence; a real secret sits OUTSIDE it."""
    root = tmp_path / "seqs"
    root.mkdir()
    (root / "legit.txt").write_text("cmd\n")
    (tmp_path / "outside.txt").write_text("cmd\n")  # real out-of-root file
    monkeypatch.setattr(gui, "SEQRoot", str(root))

    calls = []

    class FakePopen:
        def __init__(self, argv, **kwargs):
            calls.append(argv)

        def communicate(self):
            return (b"", b"")

        returncode = 0

    monkeypatch.setattr(gui.gevent.subprocess, "Popen", FakePopen)
    return root, "../outside.txt", calls


def test_seq_runs_in_root_file(seq_root):
    root, _, calls = seq_root
    gui.bg_exec_seq("legit.txt")

    assert len(calls) == 1
    argv = calls[0]
    assert argv[0] == "ait-seq-send"
    assert os.path.realpath(argv[1]).startswith(os.path.realpath(str(root)))


def test_seq_rejects_traversal_to_real_file(seq_root):
    """A traversal to a file that really exists outside SEQRoot never reaches Popen."""
    _, outside_rel, calls = seq_root
    gui.bg_exec_seq(outside_rel)  # must return early, before subprocess
    assert calls == []


@pytest.mark.parametrize("evil", ["../../../../etc/passwd", "..%2f..%2f..%2fpasswd"])
def test_seq_rejects_traversal_patterns(seq_root, evil):
    _, _, calls = seq_root
    gui.bg_exec_seq(evil)
    assert calls == []


# --------------------------------------------------------------------------
# 3. Bind host: the server uses the configured host, not hard-coded 0.0.0.0
# --------------------------------------------------------------------------
def test_server_does_not_hardcode_all_interfaces():
    source = importlib_source(gui)
    # The old, vulnerable line bound the listener to every interface.
    assert '("0.0.0.0", port)' not in source
    # The fix passes the configured host through to the WSGI server.
    assert re.search(r"WSGIServer\(\s*\n?\s*\(host, port\)", source)


def importlib_source(module):
    import inspect

    return inspect.getsource(module)
