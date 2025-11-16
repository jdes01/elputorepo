from abc import ABC, abstractmethod

from returns.result import Result

from ..entities import Event
from ..value_objects.event_id import EventId


class EventRepository(ABC):
    @abstractmethod
    def create(self, event: Event) -> Result[None, Exception]:
        pass

    @abstractmethod
    def persist(self, event: Event) -> Result[None, Exception]:
        pass

    @abstractmethod
    def get(self, event_id: EventId) -> Result[Event | None, Exception]:
        pass
