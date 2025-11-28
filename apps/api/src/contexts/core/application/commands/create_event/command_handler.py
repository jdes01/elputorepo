from dataclasses import dataclass

from returns.result import Failure, Result, Success

from src.contexts.shared import Command, CommandHandler, CommandHandlerResult, DomainError, Settings
from src.contexts.shared.domain.event_bus import EventBus
from src.contexts.shared.infrastructure.logging.logger import Logger

from ....domain import (
    Event,
    EventCapacity,
    EventId,
    EventName,
    EventPrimitives,
    EventRepository,
)


class CreateEventCommand(Command):
    event_id: str
    name: str
    capacity: int


class CreateEventResult(CommandHandlerResult):
    event: EventPrimitives


@dataclass
class CreateEventCommandHandler(CommandHandler[CreateEventCommand, CreateEventResult]):
    event_repository: EventRepository
    settings: Settings
    event_bus: EventBus
    logger: Logger

    async def handle(self, command: CreateEventCommand) -> Result[CreateEventResult, Exception]:
        self.logger.debug("Processing CreateEventCommand command", extra={"command": command.to_plain_values()})
        try:
            event_id = EventId(command.event_id)
            event_name = EventName(command.name)
            event_capacity = EventCapacity(command.capacity)
        except DomainError as e:
            self.logger.warning("Validation error", extra={"error": str(e), "event_id": command.event_id, "name": command.name, "capacity": command.capacity})
            return Failure(e)

        event = Event.create(id=event_id, name=event_name, capacity=event_capacity)

        result = self.event_repository.persist(event)

        if isinstance(result, Failure):
            self.logger.error("Error creating event", extra={"error": str(result.failure())})
            return result

        await self.event_bus.publish(event.pull_domain_events())

        self.logger.info("Event created successfully", extra={"event_id": command.event_id, "name": command.name, "capacity": command.capacity})

        return Success(CreateEventResult(event=event.to_primitives()))
