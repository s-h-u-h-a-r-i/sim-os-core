"""Stub for :mod:`interactions.base.super_interaction` (live game provides implementation)."""

from __future__ import annotations

import typing

class SuperInteraction:
    """Runtime super interaction (minimal surface used by :mod:`sim_os.sim_state`)."""

    id: int
    target: typing.Optional[object]
