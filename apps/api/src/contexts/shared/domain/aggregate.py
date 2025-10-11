from dataclasses import dataclass, field
from typing import List

from .domain_event import DomainEvent


@dataclass
class Aggregate:
    _events: List[DomainEvent] = field(default_factory=list, init=False)

    def _add_event(self, event: DomainEvent):
        self._events.append(event)

    def pull_events(self) -> List[DomainEvent]:
        events = self._events[:]
        self._events.clear()
        return events
