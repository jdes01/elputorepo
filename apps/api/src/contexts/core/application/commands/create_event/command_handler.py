from dataclasses import dataclass

from src.apps.rest.utils.schemas import Schema
from src.contexts.core.domain.entities.event import Event, EventPrimitives
from src.contexts.core.domain.repositories.event_repository import EventRepository
from src.contexts.core.domain.value_objects.event_id import EventId
from src.contexts.core.domain.value_objects.event_name import EventName
from src.contexts.shared.settings import Settings
from logger.main import get_logger


class CreateEventCommand(Schema):
    event_id: str
    name: str


class CreateEventResult(Schema):
    event: EventPrimitives


logger = get_logger(__name__)


@dataclass
class CreateEventCommandHandler:
    event_repository: EventRepository
    settings: Settings

    def handle(self, command: CreateEventCommand) -> CreateEventResult:
        logger.info(
            "Handling CreateEventCommand",
            query=command.to_plain_values(),
            found_events=[self.settings.app_name],
        )

        event = Event.create(id=EventId(command.event_id), name=EventName(command.name))

        result = self.event_repository.save(event)

        if isinstance(result, Exception):
            raise result

        return CreateEventResult(event=event.to_primitives())
