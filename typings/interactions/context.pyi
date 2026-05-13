"""Stub for :mod:`interactions.context` (live game provides implementation)."""

from __future__ import annotations

import enum

class InteractionSource(enum.IntEnum):
    PIE_MENU: int
    AUTONOMY: int
    BODY_CANCEL_AOP: int
    CARRY_CANCEL_AOP: int
    SCRIPT: int
    UNIT_TEST: int
    POSTURE_GRAPH: int
    SOCIAL_ADJUSTMENT: int
    REACTION: int
    GET_COMFORTABLE: int
    SCRIPT_WITH_USER_INTENT: int
    VEHCILE_CANCEL_AOP: int


class InteractionContext:
    source: InteractionSource
    SOURCE_PIE_MENU: InteractionSource
    SOURCE_AUTONOMY: InteractionSource
    SOURCE_BODY_CANCEL_AOP: InteractionSource
    SOURCE_CARRY_CANCEL_AOP: InteractionSource
    SOURCE_POSTURE_GRAPH: InteractionSource
    SOURCE_SOCIAL_ADJUSTMENT: InteractionSource
    SOURCE_REACTION: InteractionSource
    SOURCE_GET_COMFORTABLE: InteractionSource
    SOURCE_SCRIPT_WITH_USER_INTENT: InteractionSource
    SOURCE_VEHICLE_CANCEL_AOP: InteractionSource
    TRANSITIONAL_SOURCES: frozenset[InteractionSource]
    is_cancel_aop: bool
