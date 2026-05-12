"""Stub for :mod:`venues.venue_service` (live game provides implementation)."""

from __future__ import annotations

from collections.abc import Callable


class VenueService:
    """Zone / venue load lifecycle (minimal surface used by :mod:`sim_os.hooks`)."""

    on_loading_screen_animation_finished: Callable[..., None]
