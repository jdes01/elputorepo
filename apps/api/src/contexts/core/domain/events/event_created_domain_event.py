from dataclasses import dataclass

from src.contexts.shared.domain.domain_event import DomainEvent

from ..value_objects import EventCapacity, EventId, EventName


@dataclass
class EventCreatedDomainEvent(DomainEvent):
    event_id: EventId
    name: EventName
    capacity: EventCapacity
