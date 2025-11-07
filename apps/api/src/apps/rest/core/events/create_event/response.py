from src.contexts.core.domain.entities.event import EventPrimitives
from src.contexts.shared.domain.schemas import Schema


class CreateEventResponse(Schema):
    event: EventPrimitives
