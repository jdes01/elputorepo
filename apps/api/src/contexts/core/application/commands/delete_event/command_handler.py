from dataclasses import dataclass

from logger.main import get_logger
from returns.result import Failure, Result, Success

from src.contexts.shared import CommandHandler, Schema
from src.contexts.shared.domain.event_bus import EventBus

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
    event_bus: EventBus

    async def _handle(self, command: DeleteEventCommand) -> Result[DeleteEventResult, Exception]:
        event_id = EventId(command.event_id)

        get_result = self.event_repository.get(event_id)

        if isinstance(get_result, Failure):
            logger.error("Error getting event for deletion", extra={"error": str(get_result.failure())}, exc_info=True)
            return Failure(get_result.failure())

        if (event := get_result.unwrap()) is None:
            logger.error("Event not found for deletion", extra={"event_id": command.event_id})
            return Failure(EventNotFoundError(command.event_id))

        event.soft_delete()
        result = self.event_repository.persist(event)

        if isinstance(result, Failure):
            logger.error("Error deleting event", extra={"error": str(result.failure())}, exc_info=True)
            return Failure(result.failure())

        domain_events = event.pull_domain_events()
        await self.event_bus.publish(domain_events)
        logger.info("Event deleted successfully", extra={"event_id": command.event_id})
        return Success(DeleteEventResult(success=True))
