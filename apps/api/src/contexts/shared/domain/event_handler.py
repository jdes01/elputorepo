from abc import ABC, abstractmethod

from .domain_event import DomainEvent


class EventHandler[E: DomainEvent](ABC):
    @abstractmethod
    def handle(self, event: E) -> None:
        pass
