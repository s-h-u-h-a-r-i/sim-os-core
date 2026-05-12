"""Stub for the game's ``alarms`` module (see EA ``simulation/alarms.py``)."""

from __future__ import annotations

import typing

from date_and_time import TimeSpan

class AlarmHandle:
    def cancel(self) -> None: ...

def add_alarm_real_time(
    owner: object,
    time_span: TimeSpan,
    callback: typing.Callable[[AlarmHandle], None],
    repeating: bool,
    use_sleep_time: bool,
    cross_zone: bool = False,
) -> typing.Optional[AlarmHandle]: ...
def cancel_alarm(handle: AlarmHandle) -> None: ...
