from dataclasses import dataclass
from datetime import datetime
from pydantic import BaseModel
from src.contexts.core.domain.events.event_created_domain_event import EventCreated

from ..value_objects import EventName, EventId
from src.contexts.shared.domain.aggregate import Aggregate


class EventPrimitives(BaseModel):
    id: str
    name: str


@dataclass
class Event(Aggregate):
    id: EventId
    name: EventName

    @classmethod
    def create(cls, id: EventId, name: EventName) -> "Event":
        event = Event(id=id, name=name)
        event.__on_event_created()
        return event

    def __on_event_created(self) -> None:
        self.__add_domain_event(
            EventCreated(
                timestamp=datetime.now(),
                event_id=self.id,
                name=self.name,
            )
        )

    @classmethod
    def from_primitives(cls, data: EventPrimitives) -> "Event":
        return Event(
            id=EventId(data.id),
            name=EventName(data.name),
        )

    def to_primitives(self) -> EventPrimitives:
        return EventPrimitives(id=self.id.value, name=self.name.value)
