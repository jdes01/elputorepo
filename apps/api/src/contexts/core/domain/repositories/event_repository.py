from abc import ABC, abstractmethod
from typing import List

from returns.result import Result

from ..entities import Event
from ..value_objects.event_id import EventId


class EventRepository(ABC):
    @abstractmethod
    def save(self, event: Event) -> Result[None, Exception]:
        pass

    @abstractmethod
    def get(self, event_id: EventId) -> Result[Event | None, Exception]:
        pass

    @abstractmethod
    def get_all(self) -> Result[List[Event], Exception]:
        pass

    @abstractmethod
    def delete(self, event_id: EventId) -> Result[None, Exception]:
        pass
