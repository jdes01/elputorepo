from dependency_injector.providers import Factory

from src.contexts.shared.infrastructure.logging.logger import Logger

from ..domain.domain_event import DomainEvent
from ..domain.event_bus import EventBus


class InMemoryEventBus(EventBus):
    def __init__(self, subscriptions: dict[type[DomainEvent], list[Factory]], logger: Logger):
        self._subscriptions = subscriptions
        self.logger = logger

    async def publish(self, events: list[DomainEvent]) -> None:
        for event in events:
            handlers = self._subscriptions.get(type(event), [])

            for provider in handlers:
                handler = provider()  # ← aquí instancias el handler
                await handler.handle(event)

    def subscribe(self, event_type: type[DomainEvent], handler_provider: Factory) -> None:
        self._subscriptions.setdefault(event_type, []).append(handler_provider)
