from src.apps.rest.utils.schemas import Schema
from src.contexts.core.domain.entities.event import EventPrimitives


class CreateEventResponse(Schema):
    event: EventPrimitives
