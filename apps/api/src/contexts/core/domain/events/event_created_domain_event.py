from src.contexts.shared.domain.domain_event import DomainEvent

from ..value_objects import EventCapacity, EventId, EventName


class EventCreatedDomainEvent(DomainEvent):
    event_id: EventId
    name: EventName
    capacity: EventCapacity

    @property
    def EVENT_NAME(self) -> str:
        return "api.event_created"
