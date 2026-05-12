"""Wire shapes for game-state snapshots (JSON-serialisable)."""

from __future__ import annotations

import typing as t
from dataclasses import dataclass, field


@dataclass
class RunningInteraction:
    interaction_id: int
    interaction_id_str: str
    class_name: str


@dataclass
class QueuedInteraction:
    interaction_id: int
    interaction_id_str: str
    class_name: str
    is_queue_head: bool


@dataclass
class SerializedSim:
    """Per-Sim snapshot for the panel wire."""

    sim_id: int
    sim_id_str: str
    first_name: str
    last_name: str
    age: t.Optional[str]
    gender: t.Optional[str]
    is_npc: bool
    household_id: t.Optional[int]
    zone_id: t.Optional[int]
    interactions_running: t.List[RunningInteraction]
    interactions_queue: t.List[QueuedInteraction]
    social_partner_sim_ids: t.List[int] = field(default_factory=list)


@dataclass
class WorldState:
    lot_id: t.Optional[int]
    zone_id: t.Optional[int]
    sims: t.List[SerializedSim]
