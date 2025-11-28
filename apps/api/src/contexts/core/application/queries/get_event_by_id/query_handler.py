from dataclasses import dataclass

from returns.result import Failure, Result, Success

from src.contexts.shared import Query, QueryHandler, QueryHandlerResult
from src.contexts.shared.infrastructure.logging.logger import Logger

from ....application.services.event_projection_service import AllEventsProjectionService, EventProjection
from ....domain import EventId


class GetEventByIdQuery(Query):
    event_id: str


class GetEventByIdResult(QueryHandlerResult):
    event: EventProjection | None


@dataclass
class GetEventByIdQueryHandler(QueryHandler[GetEventByIdQuery, GetEventByIdResult]):
    event_projection_service: AllEventsProjectionService
    logger: Logger

    async def handle(self, query: GetEventByIdQuery) -> Result[GetEventByIdResult, Exception]:
        event_id = EventId(query.event_id)

        result = await self.event_projection_service.get(event_id)

        if isinstance(result, Failure):
            self.logger.error("Error getting event by id", extra={"error": str(result.failure())})
            return result

        if (event := result.unwrap()) is None:
            return Success(GetEventByIdResult(event=None))

        return Success(GetEventByIdResult(event=event))
