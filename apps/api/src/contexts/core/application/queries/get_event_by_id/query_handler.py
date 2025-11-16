from dataclasses import dataclass

from logger.main import get_logger
from returns.result import Failure, Result, Success

from src.contexts.shared import QueryHandler, Schema

from ....application.services.event_projection_service import AllEventsProjectionService
from ....domain import EventId, EventPrimitives

logger = get_logger(__name__)


class GetEventByIdQuery(Schema):
    event_id: str


class GetEventByIdResult(Schema):
    event: EventPrimitives | None


@dataclass
class GetEventByIdQueryHandler(QueryHandler[GetEventByIdQuery, GetEventByIdResult]):
    event_projection_service: AllEventsProjectionService

    async def _handle(self, query: GetEventByIdQuery) -> Result[GetEventByIdResult, Exception]:
        event_id = EventId(query.event_id)

        result = await self.event_projection_service.get(event_id)

        if isinstance(result, Failure):
            logger.error("Error getting event by id", extra={"error": str(result.failure())})
            return Failure(result.failure())

        if (event := result.unwrap()) is None:
            return Success(GetEventByIdResult(event=None))

        return Success(GetEventByIdResult(event=EventPrimitives(id=event.id, name=event.name, capacity=event.capacity)))
