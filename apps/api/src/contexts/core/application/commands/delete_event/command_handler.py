from dataclasses import dataclass

from logger.main import get_logger
from returns.result import Failure, Result, Success

from src.contexts.shared import CommandHandler, Schema

from ....domain import EventId, EventRepository
from ....domain.errors.event_not_found_error import EventNotFoundError

logger = get_logger(__name__)


class DeleteEventCommand(Schema):
    event_id: str


class DeleteEventResult(Schema):
    success: bool


@dataclass
class DeleteEventCommandHandler(CommandHandler[DeleteEventCommand, DeleteEventResult]):
    event_repository: EventRepository

    def _handle(self, command: DeleteEventCommand) -> Result[DeleteEventResult, Exception]:
        event_id = EventId(command.event_id)

        # Check if event exists first
        get_result = self.event_repository.get(event_id)
        match get_result:
            case Failure(error):
                logger.error("Error getting event for deletion", extra={"error": str(error)}, exc_info=True)
                return Failure(error)
            case Success(event):
                if event is None:
                    logger.error("Event not found for deletion", extra={"event_id": command.event_id})
                    return Failure(EventNotFoundError(command.event_id))

        # Event exists, proceed with deletion
        result = self.event_repository.delete(event_id)

        match result:
            case Failure(error):
                logger.error("Error deleting event", extra={"error": str(error)}, exc_info=True)
                return Failure(error)
            case Success(_):
                logger.info("Event deleted successfully", extra={"event_id": command.event_id})
                return Success(DeleteEventResult(success=True))
