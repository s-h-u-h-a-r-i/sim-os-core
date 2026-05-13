"""Map live SI queues to schema types."""

from __future__ import annotations

import typing

from interactions.base.super_interaction import SuperInteraction
from interactions.context import InteractionContext
from sims.sim import Sim

from .filters import si_class_is_background_noise
from .models import QueuedInteraction, RunningInteraction


def interactions_for_sim(
    sim: Sim,
) -> typing.Tuple[
    typing.List[RunningInteraction],
    typing.List[QueuedInteraction],
]:
    running: typing.List[RunningInteraction] = []
    queued: typing.List[QueuedInteraction] = []

    try:
        for si in sim.si_state.sis_actor_gen():
            running.append(_serialize_running_interaction(si))
    except Exception:
        pass

    try:
        queue = sim.queue
        if queue is not None:
            head = getattr(queue, "running", None)
            for si in queue:
                base = _serialize_running_interaction(si)
                queued.append(
                    QueuedInteraction(
                        interaction_id=base.interaction_id,
                        interaction_id_str=base.interaction_id_str,
                        class_name=base.class_name,
                        is_queue_head=bool(head is not None and si is head),
                    )
                )
    except Exception:
        pass

    return running, queued


def _categorize(si: SuperInteraction) -> typing.Tuple[str, str]:
    """Return (category, source_name) for a running interaction."""
    source_name = "UNKNOWN"
    try:
        source = si.context.source
        source_name = source.name
        if source in InteractionContext.TRANSITIONAL_SOURCES or si.context.is_cancel_aop:
            return "passive", source_name
    except Exception:
        pass
    try:
        if not si.allow_user_directed or not si.visible:
            return "passive", source_name
    except Exception:
        pass
    if si_class_is_background_noise(si.__class__.__name__):
        return "passive", source_name
    return "active", source_name


def _serialize_running_interaction(si: SuperInteraction) -> RunningInteraction:
    category, source_name = _categorize(si)
    return RunningInteraction(
        interaction_id=int(si.id),
        interaction_id_str=str(si.id),
        class_name=si.__class__.__name__,
        category=category,
        source_name=source_name,
    )
