from src.contexts.shared.domain.domain_event import DomainEvent

from ..value_objects import EventId


class EventDeletedDomainEvent(DomainEvent):
    event_id: EventId

    @property
    def EVENT_NAME(self) -> str:
        return "api.event_deleted"
