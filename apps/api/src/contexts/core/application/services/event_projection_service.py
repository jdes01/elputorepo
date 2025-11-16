from abc import ABC, abstractmethod
from dataclasses import dataclass

from returns.result import Result

from src.contexts.core.domain.value_objects.event_id import EventId


@dataclass
class EventProjection:
    id: str
    name: str
    capacity: int


class AllEventsProjectionService(ABC):
    @abstractmethod
    async def add(self, event_projection: EventProjection) -> Result[None, Exception]:
        pass

    @abstractmethod
    async def get(self, event_id: EventId) -> Result[EventProjection | None, Exception]:
        pass

    @abstractmethod
    async def get_all(self, limit: int | None = None, offset: int | None = None) -> Result[list[EventProjection], Exception]:
        pass

    @abstractmethod
    async def delete(self, event_id: EventId) -> Result[None, Exception]:
        pass
