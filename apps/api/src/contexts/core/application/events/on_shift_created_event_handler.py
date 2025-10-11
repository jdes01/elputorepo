from dataclasses import dataclass
from logger.main import get_logger
from src.contexts.core.domain.events.shift_created_domain_event import ShiftCreated
from src.contexts.shared.domain.event_handler import EventHandler

logger = get_logger(__name__)


@dataclass
class OnShiftCreatedEventHandler(EventHandler[ShiftCreated]):
    def handle(self, event: ShiftCreated) -> None:
        logger.info(
            f"Shift created with ID {event.shift_id.value} for employee {event.employee_id.value}"
        )
