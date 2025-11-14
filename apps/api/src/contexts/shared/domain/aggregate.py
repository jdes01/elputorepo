from dataclasses import dataclass, field

from .domain_event import DomainEvent


@dataclass
class Aggregate:
    _domain_events: list[DomainEvent] = field(default_factory=list, init=False)

    def _add_domain_event(self, domain_event: DomainEvent) -> None:
        self._domain_events.append(domain_event)

    def pull_domain_events(self) -> list[DomainEvent]:
        domain_events = self._domain_events[:]
        self._domain_events.clear()
        return domain_events
