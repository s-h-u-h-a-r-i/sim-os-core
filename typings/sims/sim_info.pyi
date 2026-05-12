"""Stub for :mod:`sims.sim_info` (live game provides implementation)."""

from __future__ import annotations

import typing

from sims.sim import Sim

class SimInfo:
    """Persistent Sim record (minimal surface used by :mod:`sim_os.sim_state`)."""

    id: int
    first_name: str
    last_name: str
    age: typing.Optional[_NamedEnum]
    gender: typing.Optional[_NamedEnum]
    is_npc: bool
    household_id: typing.Optional[int]
    zone_id: typing.Optional[int]

    def get_sim_instance(self) -> typing.Optional[Sim]: ...

class _NamedEnum(typing.Protocol):
    name: str
