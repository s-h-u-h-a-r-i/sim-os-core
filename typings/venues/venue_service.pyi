"""Stub for :mod:`venues.venue_service` (live game provides implementation)."""

from __future__ import annotations

import typing

class VenueService:
    """Zone / venue load lifecycle (minimal surface used by :mod:`sim_os.hooks`)."""

    on_loading_screen_animation_finished: typing.Callable[..., None]
