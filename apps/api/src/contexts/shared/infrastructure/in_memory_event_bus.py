from src.contexts.shared.domain.event_handler import EventHandler

from ..domain.domain_event import DomainEvent
from ..domain.event_bus import EventBus


class InMemoryEventBus(EventBus):
    def __init__(self, subscriptions: dict[type[DomainEvent], list[EventHandler[DomainEvent]]]):
        self._subscriptions = subscriptions

    async def publish(self, events: list[DomainEvent]) -> None:
        for event in events:
            handlers = self._subscriptions.get(type(event), [])
            for handler in handlers:
                await handler.handle(event)

    def subscribe(self, event_type: type[DomainEvent], handler: EventHandler[DomainEvent]) -> None:
        self._subscriptions.setdefault(event_type, []).append(handler)
