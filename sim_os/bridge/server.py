"""``ModBridge`` — ``ThreadingHTTPServer`` on ``127.0.0.1`` plus ``/ws`` log fan-out."""

from __future__ import annotations

import errno
import mimetypes
import queue
import secrets
import socket
import threading
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from .. import log_sink
from ..protocol import DEFAULT_BRIDGE_PORT
from . import ws_framing


def create_bridge(static_root: Path) -> ModBridge:
    return ModBridge(static_root=static_root)


def _resolve_under_static(static_root: Path, url_path: str) -> Path | None:
    rel = urllib.parse.unquote(url_path).lstrip("/")
    if not rel or rel.endswith("/"):
        rel = f"{rel}index.html".lstrip("/")
    candidate = (static_root / rel).resolve()
    try:
        candidate.relative_to(static_root)
    except ValueError:
        return None
    return candidate if candidate.is_file() else None


class ModBridge:
    """Serves ``sim_os_panel`` from ``static_root`` and streams UTF-8 JSON logs on ``/ws``."""

    def __init__(
        self,
        *,
        static_root: Path,
        host: str = "127.0.0.1",
        preferred_port: int = DEFAULT_BRIDGE_PORT,
    ) -> None:
        self.static_root = static_root.resolve()
        self.host = host
        self.preferred_port = preferred_port
        self.bound_port: int | None = None
        self.auth_token: str | None = None
        self._panel_url: str | None = None

        self._httpd: ThreadingHTTPServer | None = None
        self._http_thread: threading.Thread | None = None
        self._log_queue: queue.Queue[str] | None = None
        self._ws_lock = threading.Lock()
        self._ws_clients: list[socket.socket] = []
        self._fan_stop = threading.Event()
        self._fan_thread: threading.Thread | None = None

    # --------------------------------------------------------------------- HTTP + WS ---

    def start(self) -> str:
        """Bind HTTP+WS listener, attach :mod:`sim_os.log_sink`, return HTTP ``panel_url``.

        Safe to call once; repeats return the cached URL without rebinding.
        """
        if self._panel_url is not None:
            return self._panel_url

        self.auth_token = secrets.token_urlsafe(24)
        self._log_queue = queue.Queue(maxsize=10000)
        log_sink.attach_log_queue(self._log_queue)

        self._fan_stop.clear()
        fan = threading.Thread(
            target=self._fanout_loop, name="sim_os.bridge.fanout", daemon=True
        )
        self._fan_thread = fan
        fan.start()

        bridge = self

        class _Handler(BaseHTTPRequestHandler):
            protocol_version = "HTTP/1.1"

            def log_message(self, fmt: str, *_args: object) -> None:  # noqa: ARG002
                return

            def do_GET(self) -> None:
                parsed = urllib.parse.urlparse(self.path)

                if parsed.path == "/ws":
                    qs = urllib.parse.parse_qs(parsed.query, keep_blank_values=True)
                    supplied = qs.get("token", [""])[0]
                    if not bridge.auth_token or supplied != bridge.auth_token:
                        self.send_error(403, "Forbidden")
                        return

                    ws_key = self.headers.get("Sec-WebSocket-Key")
                    if not ws_key:
                        self.send_error(400, "Bad Request")
                        return

                    accept = ws_framing.compute_sec_websocket_accept(ws_key)
                    self.send_response(101, "Switching Protocols")
                    self.send_header("Upgrade", "websocket")
                    self.send_header("Connection", "Upgrade")
                    self.send_header("Sec-WebSocket-Accept", accept)
                    self.end_headers()
                    self.wfile.flush()

                    sock = self.connection  # noqa: SLF001
                    with bridge._ws_lock:
                        bridge._ws_clients.append(sock)
                    try:
                        while ws_framing.pump_ws_client(sock):
                            pass
                    finally:
                        with bridge._ws_lock:
                            if sock in bridge._ws_clients:
                                bridge._ws_clients.remove(sock)
                        try:
                            sock.shutdown(socket.SHUT_RDWR)
                        except OSError:
                            pass
                    return

                path = parsed.path or "/"
                fs_path = _resolve_under_static(
                    bridge.static_root,
                    path if path != "/" else "/index.html",
                )
                if fs_path is None:
                    self.send_error(404, "Not Found")
                    return
                body = fs_path.read_bytes()
                mime, _enc = mimetypes.guess_type(str(fs_path))
                self.send_response(200)
                self.send_header("Content-Type", mime or "application/octet-stream")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

        try:
            httpd = ThreadingHTTPServer((self.host, self.preferred_port), _Handler)  # type: ignore[arg-type]
        except OSError as exc:
            if getattr(exc, "errno", None) != errno.EADDRINUSE:
                raise
            httpd = ThreadingHTTPServer((self.host, 0), _Handler)  # type: ignore[arg-type]

        _, port = httpd.socket.getsockname()[:2]
        self.bound_port = int(port)
        self._httpd = httpd
        srv_thread = threading.Thread(
            target=httpd.serve_forever,
            name="sim_os.bridge.http",
            daemon=True,
        )
        srv_thread.start()
        self._http_thread = srv_thread

        quoted = urllib.parse.quote(self.auth_token, safe="")
        self._panel_url = f"http://{self.host}:{self.bound_port}/?token={quoted}"
        return self._panel_url

    # -------------------------------------------------------------------------

    def _fanout_loop(self) -> None:
        assert self._log_queue is not None
        q = self._log_queue
        while not self._fan_stop.is_set():
            try:
                line = q.get(timeout=0.25)
            except queue.Empty:
                continue
            frame = ws_framing.encode_ws_text_utf8(line)

            with self._ws_lock:
                targets = list(self._ws_clients)
            stale: list[socket.socket] = []
            for sock in targets:
                try:
                    sock.sendall(frame)
                except OSError:
                    stale.append(sock)
            if stale:
                with self._ws_lock:
                    for s in stale:
                        if s in self._ws_clients:
                            self._ws_clients.remove(s)
