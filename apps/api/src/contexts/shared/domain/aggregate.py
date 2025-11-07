from dataclasses import dataclass, field
from typing import List

from .domain_event import DomainEvent


@dataclass
class Aggregate:
    _domain_events: List[DomainEvent] = field(default_factory=list, init=False)

    def _add_domain_event(self, domain_event: DomainEvent):
        self._domain_events.append(domain_event)

    def __pull_domain_events(self) -> List[DomainEvent]:
        domain_events = self._domain_events[:]
        self._domain_events.clear()
        return domain_events
