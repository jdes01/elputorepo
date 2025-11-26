from dataclasses import dataclass

from src.contexts.core.application.services.event_projection_service import AllEventsProjectionService, EventProjection
from src.contexts.core.domain.events.event_created_domain_event import EventCreatedDomainEvent
from src.contexts.shared.application.event.event_handler import EventHandler
from src.contexts.shared.infrastructure.logging.logger import Logger


@dataclass
class OnEventCreatedEventHandler(EventHandler[EventCreatedDomainEvent]):
    event_projection_service: AllEventsProjectionService
    logger: Logger

    async def handle(self, event: EventCreatedDomainEvent) -> None:
        self.logger.debug(f"Updating event projection - adding event {event.event_id.value}")

        await self.event_projection_service.add(
            EventProjection(
                id=event.event_id.value,
                name=event.name.value,
                capacity=event.capacity.value,
            )
        )
        self.logger.info("Event projection updated successfully")
