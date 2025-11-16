from abc import ABC, abstractmethod

from src.contexts.shared.domain.domain_event import DomainEvent
from src.contexts.shared.domain.event_handler import EventHandler


class EventBus(ABC):
    @abstractmethod
    async def publish(self, events: list[DomainEvent]) -> None:
        pass

    @abstractmethod
    def subscribe(self, event_type: type[DomainEvent], handler: EventHandler[DomainEvent]) -> None:
        pass
