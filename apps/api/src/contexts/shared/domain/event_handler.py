from abc import ABC, abstractmethod
from typing import Generic, TypeVar
from src.contexts.shared.domain.domain_event import DomainEvent

E = TypeVar("E", bound=DomainEvent)


class EventHandler(ABC, Generic[E]):
    @abstractmethod
    def handle(self, event: E) -> None:
        pass
