from dataclasses import dataclass

from returns.result import Failure, Result, Success

from src.contexts.core.application.services.event_projection_service import AllEventsProjectionService
from src.contexts.shared import Query, QueryHandler, QueryHandlerResult
from src.contexts.shared.infrastructure.logging.logger import Logger

from ....domain import EventPrimitives


class GetAllEventsQuery(Query):
    limit: int | None = None
    offset: int | None = None


class GetAllEventsResult(QueryHandlerResult):
    events: list[EventPrimitives]


@dataclass
class GetAllEventsQueryHandler(QueryHandler[GetAllEventsQuery, GetAllEventsResult]):
    event_projection_service: AllEventsProjectionService
    logger: Logger

    async def handle(self, query: GetAllEventsQuery) -> Result[GetAllEventsResult, Exception]:
        result = await self.event_projection_service.get_all(limit=query.limit, offset=query.offset)

        if isinstance(result, Failure):
            self.logger.error("Error getting all events", extra={"error": str(result.failure())})
            return Failure(result.failure())

        return Success(GetAllEventsResult(events=[EventPrimitives(id=event.id, name=event.name, capacity=event.capacity) for event in result.unwrap()]))
