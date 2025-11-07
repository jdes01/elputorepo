from dataclasses import dataclass

from src.contexts.shared.domain.domain_event import DomainEvent

from ..value_objects import EventId, EventName, EventCapacity


@dataclass
class EventCreated(DomainEvent):
    event_id: EventId
    name: EventName
    capacity: EventCapacity
