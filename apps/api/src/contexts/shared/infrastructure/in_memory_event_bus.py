from typing import Type

from src.contexts.shared.domain.event_handler import EventHandler

from ..domain.domain_event import DomainEvent
from ..domain.event_bus import EventBus


class InMemoryEventBus(EventBus):
    def __init__(self, subscriptions: dict[Type[DomainEvent], list[EventHandler[DomainEvent]]]):
        self._subscriptions = subscriptions

    def publish(self, events: list[DomainEvent]) -> None:
        for event in events:
            handlers = self._subscriptions.get(type(event), [])
            for handler in handlers:
                handler.handle(event)

    def subscribe(self, event_type: Type[DomainEvent], handler: EventHandler[DomainEvent]) -> None:
        self._subscriptions.setdefault(event_type, []).append(handler)
