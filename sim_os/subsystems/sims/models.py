"""Wire shapes for game-state snapshots (JSON-serialisable)."""

from __future__ import annotations

import typing
from dataclasses import dataclass, field

InteractionCategory = str


@dataclass
class RunningInteraction:
    interaction_id: int
    interaction_id_str: str
    class_name: str
    category: InteractionCategory
    source_name: str


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
    age: typing.Optional[str]
    gender: typing.Optional[str]
    is_npc: bool
    household_id: typing.Optional[int]
    zone_id: typing.Optional[int]
    interactions_running: typing.List[RunningInteraction]
    interactions_queue: typing.List[QueuedInteraction]
    social_partner_sim_ids: typing.List[int] = field(default_factory=list)


@dataclass
class WorldState:
    lot_id: typing.Optional[int]
    zone_id: typing.Optional[int]
    sims: typing.List[SerializedSim]
