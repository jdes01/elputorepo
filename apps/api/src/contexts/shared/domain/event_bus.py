from abc import ABC, abstractmethod
from typing import Type

from src.contexts.shared.domain.domain_event import DomainEvent
from src.contexts.shared.domain.event_handler import EventHandler


class EventBus(ABC):
    @abstractmethod
    def publish(self, events: list[DomainEvent]) -> None:
        pass

    @abstractmethod
    def subscribe(self, event_type: Type[DomainEvent], handler: EventHandler[DomainEvent]) -> None:
        pass
