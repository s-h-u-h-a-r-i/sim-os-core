"""JSON-safe dicts for WebSocket log payloads."""

from __future__ import annotations

import typing as t
from dataclasses import asdict

from .models import SerializedSim, WorldState


def world_state_to_wire(world: WorldState) -> dict[str, t.Any]:
    def _serialized_sim_to_wire(sim: SerializedSim) -> dict[str, t.Any]:
        d = asdict(sim)
        d["sim_id"] = str(sim.sim_id)
        d["social_partner_sim_ids"] = [str(pid) for pid in sim.social_partner_sim_ids]
        return d

    return {
        "lot_id": world.lot_id,
        "zone_id": world.zone_id,
        "sims": [_serialized_sim_to_wire(s) for s in world.sims],
    }
