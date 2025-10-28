from abc import ABC, abstractmethod

from ..entities import Event
from ..value_objects.event_id import EventId


class EventRepository(ABC):
    @abstractmethod
    def save(self, event: Event) -> None | Exception:
        pass

    @abstractmethod
    def get(self, event_id: EventId) -> Event | None | Exception:
        pass
