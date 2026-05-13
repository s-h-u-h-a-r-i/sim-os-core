"""Stub for :mod:`interactions.base.super_interaction` (live game provides implementation)."""

from __future__ import annotations

import typing

from ..context import InteractionContext

class SuperInteraction:
    """Runtime super interaction (minimal surface used by :mod:`sim_os.sim_state`)."""

    id: int
    context: InteractionContext
    allow_user_directed: bool
    visible: bool
    target: typing.Optional[object]
    interaction_target: typing.Optional[object]
    _social_group: typing.Optional[object]
    _liabilities: typing.Optional[typing.Iterable[object]]
    _kwargs: typing.Optional[typing.Dict[str, object]]
    _interactions: typing.Optional[typing.Iterable[SuperInteraction]]
    interactions: typing.Optional[typing.Iterable[SuperInteraction]]
    _mixer_interactions: typing.Optional[typing.Iterable[SuperInteraction]]
    mixer_interactions: typing.Optional[typing.Iterable[SuperInteraction]]
