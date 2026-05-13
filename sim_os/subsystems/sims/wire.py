"""JSON-safe dicts for WebSocket log payloads."""

from __future__ import annotations

import typing as t

from .models import SerializedSim, WorldState


class RunningInteractionWire(t.TypedDict):
    interaction_id: int
    interaction_id_str: str
    class_name: str


class QueuedInteractionWire(t.TypedDict):
    interaction_id: int
    interaction_id_str: str
    class_name: str
    is_queue_head: bool


class SerializedSimWire(t.TypedDict):
    sim_id: str
    sim_id_str: str
    first_name: str
    last_name: str
    age: t.Optional[str]
    gender: t.Optional[str]
    is_npc: bool
    household_id: t.Optional[int]
    zone_id: t.Optional[int]
    interactions_running: t.List[RunningInteractionWire]
    interactions_queue: t.List[QueuedInteractionWire]
    social_partner_sim_ids: t.List[str]


class WorldStateWire(t.TypedDict):
    lot_id: t.Optional[int]
    zone_id: t.Optional[int]
    sims: t.List[SerializedSimWire]


def world_state_to_wire(world: WorldState) -> WorldStateWire:
    def _serialized_sim_to_wire(sim: SerializedSim) -> SerializedSimWire:
        return SerializedSimWire(
            sim_id=str(sim.sim_id),
            sim_id_str=sim.sim_id_str,
            first_name=sim.first_name,
            last_name=sim.last_name,
            age=sim.age,
            gender=sim.gender,
            is_npc=sim.is_npc,
            household_id=sim.household_id,
            zone_id=sim.zone_id,
            interactions_running=[
                RunningInteractionWire(
                    interaction_id=r.interaction_id,
                    interaction_id_str=r.interaction_id_str,
                    class_name=r.class_name,
                )
                for r in sim.interactions_running
            ],
            interactions_queue=[
                QueuedInteractionWire(
                    interaction_id=q.interaction_id,
                    interaction_id_str=q.interaction_id_str,
                    class_name=q.class_name,
                    is_queue_head=q.is_queue_head,
                )
                for q in sim.interactions_queue
            ],
            social_partner_sim_ids=[str(pid) for pid in sim.social_partner_sim_ids],
        )

    return WorldStateWire(
        lot_id=world.lot_id,
        zone_id=world.zone_id,
        sims=[_serialized_sim_to_wire(s) for s in world.sims],
    )
