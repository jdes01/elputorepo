from dataclasses import dataclass

from logger.main import get_logger

from src.contexts.core.application.services.event_projection_service import AllEventsProjectionService, EventProjection
from src.contexts.core.domain.events.event_created_domain_event import EventCreatedDomainEvent
from src.contexts.shared.domain.event_handler import EventHandler

logger = get_logger(__name__)


@dataclass
class OnEventCreatedEventHandler(EventHandler[EventCreatedDomainEvent]):
    event_projection_service: AllEventsProjectionService

    async def handle(self, event: EventCreatedDomainEvent) -> None:
        logger.info(f"Updating event projection - adding event {event.event_id.value}")

        self.event_projection_service.add(
            EventProjection(
                id=event.event_id.value,
                name=event.name.value,
                capacity=event.capacity.value,
            )
        )
