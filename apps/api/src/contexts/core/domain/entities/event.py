from dataclasses import dataclass, field
from datetime import datetime

from pydantic import BaseModel

from src.contexts.core.domain.events.event_created_domain_event import EventCreated
from src.contexts.shared.domain.aggregate import Aggregate

from ..value_objects import EventId, EventName


class EventPrimitives(BaseModel):
    id: str
    name: str
    deleted_at: datetime | None = None


@dataclass
class Event(Aggregate):
    id: EventId
    name: EventName
    _deleted_at: datetime | None = field(default=None, init=False)

    @classmethod
    def create(cls, id: EventId, name: EventName) -> "Event":
        event = Event(id=id, name=name)
        event.__on_event_created()
        return event

    def __on_event_created(self) -> None:
        self._add_domain_event(
            EventCreated(
                timestamp=datetime.now(),
                event_id=self.id,
                name=self.name,
            )
        )

    @classmethod
    def from_primitives(cls, data: EventPrimitives) -> "Event":
        event = Event(
            id=EventId(data.id),
            name=EventName(data.name),
        )
        if data.deleted_at:
            event._deleted_at = data.deleted_at
        return event

    def to_primitives(self) -> EventPrimitives:
        return EventPrimitives(
            id=self.id.value,
            name=self.name.value,
            deleted_at=self._deleted_at,
        )

    def soft_delete(self) -> None:
        self._deleted_at = datetime.now()

    def is_deleted(self) -> bool:
        return self._deleted_at is not None
