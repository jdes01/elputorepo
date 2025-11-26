from abc import ABC, abstractmethod

from dependency_injector.providers import Factory

from src.contexts.shared.domain.domain_event import DomainEvent
from src.contexts.shared.infrastructure.logging.logger import Logger


class EventBus(ABC):
    logger: Logger

    @abstractmethod
    async def publish(self, events: list[DomainEvent]) -> None:
        pass

    @abstractmethod
    def subscribe(self, event_type: type[DomainEvent], handler_provider: Factory) -> None:
        pass
