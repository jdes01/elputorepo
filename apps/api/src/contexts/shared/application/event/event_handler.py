from abc import ABC, abstractmethod

from ...domain.domain_event import DomainEvent


class EventHandler[E: DomainEvent](ABC):
    @abstractmethod
    async def handle(self, event: E) -> None:
        pass
