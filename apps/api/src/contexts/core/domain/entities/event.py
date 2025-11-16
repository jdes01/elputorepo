from dataclasses import dataclass
from datetime import datetime

from pydantic import BaseModel

from src.contexts.core.domain.events.event_created_domain_event import EventCreatedDomainEvent
from src.contexts.core.domain.events.event_deleted_domain_event import EventDeletedDomainEvent
from src.contexts.shared.domain.aggregate import Aggregate

from ..value_objects import EventCapacity, EventId, EventName


class EventPrimitives(BaseModel):
    id: str
    name: str
    capacity: int


@dataclass
class Event(Aggregate):
    id: EventId
    name: EventName
    capacity: EventCapacity

    @classmethod
    def create(cls, id: EventId, name: EventName, capacity: EventCapacity) -> "Event":
        event = Event(id=id, name=name, capacity=capacity)
        event.__on_event_created()
        return event

    def __on_event_created(self) -> None:
        self._add_domain_event(
            EventCreatedDomainEvent(
                timestamp=datetime.now(),
                event_id=self.id,
                name=self.name,
                capacity=self.capacity,
            )
        )

    @classmethod
    def from_primitives(cls, data: EventPrimitives) -> "Event":
        return Event(
            id=EventId(data.id),
            name=EventName(data.name),
            capacity=EventCapacity(data.capacity),
        )

    def to_primitives(self) -> EventPrimitives:
        return EventPrimitives(
            id=self.id.value,
            name=self.name.value,
            capacity=self.capacity.value,
        )

    def soft_delete(self) -> None:
        self._deleted_at = datetime.now()
        self.__on_event_deleted()

    def __on_event_deleted(self) -> None:
        self._add_domain_event(
            EventDeletedDomainEvent(
                timestamp=datetime.now(),
                event_id=self.id,
            )
        )
