from dataclasses import dataclass

from returns.result import Failure, Result, Success

from src.contexts.shared import Command, CommandHandler, CommandHandlerResult
from src.contexts.shared.domain.event_bus import EventBus
from src.contexts.shared.infrastructure.logging.logger import Logger

from ....domain import EventId, EventRepository
from ....domain.errors.event_not_found_error import EventNotFoundError


class DeleteEventCommand(Command):
    event_id: str


class DeleteEventResult(CommandHandlerResult):
    success: bool


@dataclass
class DeleteEventCommandHandler(CommandHandler[DeleteEventCommand, DeleteEventResult]):
    event_repository: EventRepository
    event_bus: EventBus
    logger: Logger

    async def handle(self, command: DeleteEventCommand) -> Result[DeleteEventResult, Exception]:
        self.logger.debug("Processing DeleteEventCommandHandler command", extra={"command": command.to_plain_values()})

        event_id = EventId(command.event_id)

        get_result = self.event_repository.get(event_id)

        if isinstance(get_result, Failure):
            self.logger.error("Error getting event for deletion", extra={"error": str(get_result.failure())})
            return Failure(get_result.failure())

        if (event := get_result.unwrap()) is None:
            self.logger.error("Event not found for deletion", extra={"event_id": command.event_id})
            return Failure(EventNotFoundError(command.event_id))

        event.delete()
        result = self.event_repository.persist(event)

        if isinstance(result, Failure):
            self.logger.error("Error deleting event", extra={"error": str(result.failure())})
            return Failure(result.failure())

        domain_events = event.pull_domain_events()
        await self.event_bus.publish(domain_events)
        self.logger.info("Event deleted successfully", extra={"event_id": command.event_id})
        return Success(DeleteEventResult(success=True))
