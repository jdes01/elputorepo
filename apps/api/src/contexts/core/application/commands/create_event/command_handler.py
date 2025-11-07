from dataclasses import dataclass

from logger.main import get_logger
from returns.result import Failure, Result, Success

from src.contexts.shared import CommandHandler, DomainError, Schema, Settings
from src.contexts.shared.domain.event_bus import EventBus

from ....domain import Event, EventCapacity, EventId, EventName, EventPrimitives, EventRepository

logger = get_logger(__name__)


class CreateEventCommand(Schema):
    event_id: str
    name: str
    capacity: int


class CreateEventResult(Schema):
    event: EventPrimitives


@dataclass
class CreateEventCommandHandler(CommandHandler[CreateEventCommand, CreateEventResult]):
    event_repository: EventRepository
    settings: Settings
    event_bus: EventBus

    def _handle(self, command: CreateEventCommand) -> Result[CreateEventResult, Exception]:
        try:
            event_id = EventId(command.event_id)
            event_name = EventName(command.name)
            event_capacity = EventCapacity(command.capacity)
        except DomainError as e:
            logger.warning("Validation error", extra={"error": str(e), "event_id": command.event_id, "name": command.name, "capacity": command.capacity})
            return Failure(e)

        event = Event.create(id=event_id, name=event_name, capacity=event_capacity)

        result = self.event_repository.save(event)

        match result:
            case Failure(error):
                logger.error("Error creating event", extra={"error": str(error)}, exc_info=True)
                return Failure(error)
            case Success(_):
                domain_events = event.pull_domain_events()
                self.event_bus.publish(domain_events)
                logger.info("Event created successfully", extra={"event_id": command.event_id, "name": command.name, "capacity": command.capacity})
                return Success(CreateEventResult(event=event.to_primitives()))
