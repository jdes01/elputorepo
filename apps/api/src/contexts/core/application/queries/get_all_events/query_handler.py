from dataclasses import dataclass

from logger.main import get_logger
from returns.result import Failure, Result, Success

from src.contexts.core.application.services.event_projection_service import AllEventsProjectionService
from src.contexts.shared import QueryHandler, Schema

from ....domain import EventPrimitives

logger = get_logger(__name__)


class GetAllEventsQuery(Schema):
    limit: int | None = None
    offset: int | None = None


class GetAllEventsResult(Schema):
    events: list[EventPrimitives]


@dataclass
class GetAllEventsQueryHandler(QueryHandler[GetAllEventsQuery, GetAllEventsResult]):
    event_projection_service: AllEventsProjectionService

    async def _handle(self, query: GetAllEventsQuery) -> Result[GetAllEventsResult, Exception]:
        result = self.event_projection_service.get_all(limit=query.limit, offset=query.offset)

        if isinstance(result, Failure):
            logger.error("Error getting all events", extra={"error": str(result.failure())})
            return Failure(result.failure())

        return Success(GetAllEventsResult(events=[EventPrimitives(id=event.id, name=event.name, capacity=event.capacity) for event in result.unwrap()]))
