from src.contexts.shared.domain.domain_event import DomainEvent
from src.contexts.shared.domain.event_bus import EventBus
from src.contexts.shared.domain.event_handler import EventHandler


class CompositeEventBus(EventBus):
    def __init__(self, in_memory_bus: EventBus, rabbitmq_bus: EventBus):
        self._in_memory_bus = in_memory_bus
        self._rabbitmq_bus = rabbitmq_bus

    def publish(self, events: list[DomainEvent]) -> None:
        self._in_memory_bus.publish(events)
        self._rabbitmq_bus.publish(events)

    def subscribe(self, event_type: type[DomainEvent], handler: EventHandler[DomainEvent]) -> None:
        self._in_memory_bus.subscribe(event_type, handler)
