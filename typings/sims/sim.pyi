"""Stub for :mod:`sims.sim` (live game provides implementation)."""

from __future__ import annotations

import typing

from interactions.base.super_interaction import SuperInteraction
from sims.sim_info import SimInfo

class Sim:
    """Instanced Sim in the zone (minimal surface used by :mod:`sim_os.sim_state`)."""

    si_state: _SiState
    queue: typing.Optional[typing.Iterable[SuperInteraction]]
    id: int
    sim_info: SimInfo

class _SiState(typing.Protocol):
    def sis_actor_gen(self) -> typing.Iterator[SuperInteraction]: ...
