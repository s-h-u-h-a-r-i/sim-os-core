"""Stub for :mod:`services` (live game provides implementation)."""

from __future__ import annotations

import typing

from sims.sim_info import SimInfo

class _SimInfoManager(typing.Protocol):
    def values(self) -> typing.Iterator[SimInfo]: ...

def current_zone_id() -> typing.Optional[int]: ...
def active_lot_id() -> typing.Optional[int]: ...
def sim_info_manager() -> typing.Optional[_SimInfoManager]: ...
