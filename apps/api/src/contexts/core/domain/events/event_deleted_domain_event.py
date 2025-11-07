from dataclasses import dataclass

from src.contexts.shared.domain.domain_event import DomainEvent

from ..value_objects import EventId


@dataclass
class EventDeleted(DomainEvent):
    event_id: EventId

