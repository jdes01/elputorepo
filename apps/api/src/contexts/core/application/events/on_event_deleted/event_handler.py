from dataclasses import dataclass

from logger.main import get_logger

from src.contexts.core.application.services.event_projection_service import AllEventsProjectionService
from src.contexts.core.domain.events.event_deleted_domain_event import EventDeletedDomainEvent
from src.contexts.core.domain.value_objects.event_id import EventId
from src.contexts.shared.domain.event_handler import EventHandler

logger = get_logger(__name__)


@dataclass
class OnEventDeletedEventHandler(EventHandler[EventDeletedDomainEvent]):
    event_projection_service: AllEventsProjectionService

    async def handle(self, event: EventDeletedDomainEvent) -> None:
        logger.info(f"Updating event projection - deletting event {event.event_id.value}")

        self.event_projection_service.delete(EventId(event.event_id.value))
