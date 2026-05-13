"""JSON-safe dicts for WebSocket log payloads."""

from __future__ import annotations

import typing

from .models import InteractionCategory, SerializedSim, WorldState

if typing.TYPE_CHECKING:
    from typing import TypedDict

    class RunningInteractionWire(TypedDict):
        interaction_id: int
        interaction_id_str: str
        class_name: str
        category: InteractionCategory
        source_name: str

    class QueuedInteractionWire(TypedDict):
        interaction_id: int
        interaction_id_str: str
        class_name: str
        is_queue_head: bool

    class SerializedSimWire(TypedDict):
        sim_id: str
        sim_id_str: str
        first_name: str
        last_name: str
        age: typing.Optional[str]
        gender: typing.Optional[str]
        is_npc: bool
        household_id: typing.Optional[int]
        zone_id: typing.Optional[int]
        interactions_running: typing.List[RunningInteractionWire]
        interactions_queue: typing.List[QueuedInteractionWire]
        social_partner_sim_ids: typing.List[str]

    class WorldStateWire(TypedDict):
        lot_id: typing.Optional[int]
        zone_id: typing.Optional[int]
        sims: typing.List[SerializedSimWire]


def world_state_to_wire(world: WorldState) -> WorldStateWire:
    """Build ``fields.state`` payloads; must use dict literals — wire TypedDicts are static-only."""

    def _serialized_sim_to_wire(sim: SerializedSim) -> SerializedSimWire:
        running: typing.List[RunningInteractionWire] = []
        for r in sim.interactions_running:
            ri: RunningInteractionWire = {
                "interaction_id": r.interaction_id,
                "interaction_id_str": r.interaction_id_str,
                "class_name": r.class_name,
                "category": r.category,
                "source_name": r.source_name,
            }
            running.append(ri)

        queued: typing.List[QueuedInteractionWire] = []
        for q in sim.interactions_queue:
            qi: QueuedInteractionWire = {
                "interaction_id": q.interaction_id,
                "interaction_id_str": q.interaction_id_str,
                "class_name": q.class_name,
                "is_queue_head": q.is_queue_head,
            }
            queued.append(qi)

        out: SerializedSimWire = {
            "sim_id": str(sim.sim_id),
            "sim_id_str": sim.sim_id_str,
            "first_name": sim.first_name,
            "last_name": sim.last_name,
            "age": sim.age,
            "gender": sim.gender,
            "is_npc": sim.is_npc,
            "household_id": sim.household_id,
            "zone_id": sim.zone_id,
            "interactions_running": running,
            "interactions_queue": queued,
            "social_partner_sim_ids": [str(pid) for pid in sim.social_partner_sim_ids],
        }
        return out

    result: WorldStateWire = {
        "lot_id": world.lot_id,
        "zone_id": world.zone_id,
        "sims": [_serialized_sim_to_wire(s) for s in world.sims],
    }
    return result
