"""After live load completes, run :func:`~sim_os.bootstrap.ensure_bridge_started` on the game thread."""

from __future__ import annotations

import typing

from venues.venue_service import VenueService

from .bootstrap import ensure_bridge_started

_orig_loading_finished = VenueService.on_loading_screen_animation_finished


def _on_loading_screen_animation_finished(
    self: VenueService,
    *args: typing.Any,
    **kwargs: typing.Any,
) -> typing.Any:
    result = _orig_loading_finished(self, *args, **kwargs)

    ensure_bridge_started()
    return result


VenueService.on_loading_screen_animation_finished = (
    _on_loading_screen_animation_finished
)
