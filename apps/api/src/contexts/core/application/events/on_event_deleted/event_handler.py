from dataclasses import dataclass

from src.contexts.core.application.services.event_projection_service import AllEventsProjectionService
from src.contexts.core.domain.events.event_deleted_domain_event import EventDeletedDomainEvent
from src.contexts.core.domain.value_objects.event_id import EventId
from src.contexts.shared.application.event.event_handler import EventHandler
from src.contexts.shared.infrastructure.logging.logger import Logger


@dataclass
class OnEventDeletedEventHandler(EventHandler[EventDeletedDomainEvent]):
    event_projection_service: AllEventsProjectionService
    logger: Logger

    async def handle(self, event: EventDeletedDomainEvent) -> None:
        self.logger.debug(f"Updating event projection - deletting event {event.event_id.value}")

        await self.event_projection_service.delete(EventId(event.event_id.value))

        self.logger.info("Event projection updated successfully")
