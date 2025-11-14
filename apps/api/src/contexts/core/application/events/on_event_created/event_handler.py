from dataclasses import dataclass

from logger.main import get_logger

from src.contexts.core.domain.events.event_created_domain_event import EventCreated
from src.contexts.shared.domain.event_handler import EventHandler

logger = get_logger(__name__)


@dataclass
class OnEventCreatedEventHandler(EventHandler[EventCreated]):
    def handle(self, event: EventCreated) -> None:
        logger.info(f"Event created with ID {event.event_id.value} and name {event.name.value}")
