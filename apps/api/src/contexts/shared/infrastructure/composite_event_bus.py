from dependency_injector.providers import Factory

from ..domain.domain_event import DomainEvent
from ..domain.event_bus import EventBus


class CompositeEventBus(EventBus):
    def __init__(self, in_memory_bus: EventBus, rabbitmq_bus: EventBus):
        self._in_memory_bus = in_memory_bus
        self._rabbitmq_bus = rabbitmq_bus

    async def publish(self, events: list[DomainEvent]) -> None:
        await self._in_memory_bus.publish(events)
        await self._rabbitmq_bus.publish(events)

    def subscribe(self, event_type: type[DomainEvent], handler: Factory) -> None:
        self._in_memory_bus.subscribe(event_type, handler)
