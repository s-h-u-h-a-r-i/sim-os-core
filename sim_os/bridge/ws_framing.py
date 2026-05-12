"""RFC 6455 helpers for bridging (handshake accept + outbound + minimal inbound parse)."""

from __future__ import annotations

import base64
import hashlib
import socket
import struct
import typing

# RFC6455 §4 — Sec-WebSocket-Accept
_WS_ACCEPT_MAGIC = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

# Opcodes used by clients we care about draining.
_WS_OP_CONTINUE = 0x0
_WS_OP_TEXT = 0x1
_WS_OP_CLOSE = 0x8
_WS_OP_PING = 0x9
_WS_OP_PONG = 0xA


def compute_sec_websocket_accept(sec_websocket_key: str) -> str:
    blob = (sec_websocket_key.strip() + _WS_ACCEPT_MAGIC).encode("ascii")
    return base64.b64encode(hashlib.sha1(blob).digest()).decode("ascii")


def encode_ws_text_utf8(payload: str) -> bytes:
    """Server → client FIN + text opcode 1 frame (payload unmasked per RFC6455 §5)."""
    data = payload.encode("utf-8")
    header = bytearray([0x81])
    byte_len = len(data)
    if byte_len < 126:
        header.append(byte_len)
    elif byte_len < 65536:
        header.append(126)
        header.extend(struct.pack("!H", byte_len))
    else:
        header.append(127)
        header.extend(struct.pack("!Q", byte_len))
    return bytes(header) + data


def pump_ws_client(
    sock: socket.socket,
    *,
    max_payload: int = 1 << 18,
    respond_to_ping: bool = True,
) -> bool:
    """Consume one inbound WebSocket frame from the client.

    Returns ``False`` when the peer closed or EOF; ``True`` to keep reading.

    Caller must negotiate the upgrade already; masking is enforced for client payloads.
    """
    hdr = _recv_exact(sock, 2)
    if hdr is None or len(hdr) < 2:
        return False

    opcode = hdr[0] & 0x0F
    masked = (hdr[1] >> 7) & 0x01
    length = hdr[1] & 0x7F

    if length == 126:
        ext = _recv_exact(sock, 2)
        if ext is None:
            return False
        length = struct.unpack("!H", ext)[0]
    elif length == 127:
        ext = _recv_exact(sock, 8)
        if ext is None:
            return False
        length = struct.unpack("!Q", ext)[0]

    if length > max_payload:
        return False

    if not masked:
        return False
    mk = _recv_exact(sock, 4)
    if mk is None or len(mk) < 4:
        return False
    masking_key = mk

    payload = _recv_exact(sock, length)
    if payload is None:
        return False

    if payload:
        payload = bytes(b ^ masking_key[i % 4] for i, b in enumerate(payload))

    if opcode == _WS_OP_CLOSE:
        return False
    if opcode == _WS_OP_PING and respond_to_ping:
        sock.sendall(_encode_ws_pong(payload))
        return True
    if opcode in {_WS_OP_TEXT, _WS_OP_CONTINUE, _WS_OP_PONG}:
        return True
    return True


def _recv_exact(sock: socket.socket, n: int) -> typing.Optional[bytes]:
    """Read exactly ``n`` bytes from a blocking TCP socket."""
    chunks: list[bytes] = []
    got = 0
    while got < n:
        b = sock.recv(n - got)
        if not b:
            return None
        chunks.append(b)
        got += len(b)
    return b"".join(chunks)


def _encode_ws_pong(payload: bytes = b"") -> bytes:
    """Server → client pong (opcode 0xA); payload usually empty."""
    opcode = _WS_OP_PONG
    header = bytearray([0x80 | (opcode & 0x0F)])
    byte_len = len(payload)
    if byte_len < 126:
        header.append(byte_len)
    elif byte_len < 65536:
        header.append(126)
        header.extend(struct.pack("!H", byte_len))
    else:
        header.append(127)
        header.extend(struct.pack("!Q", byte_len))
    return bytes(header) + payload
