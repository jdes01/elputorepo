from dataclasses import dataclass

from logger.main import get_logger
from returns.result import Failure, Result, Success

from src.contexts.shared import QueryHandler, Schema

from ....domain import EventPrimitives, EventRepository

logger = get_logger(__name__)


class GetAllEventsQuery(Schema):
    pass


class GetAllEventsResult(Schema):
    events: list[EventPrimitives]


@dataclass
class GetAllEventsQueryHandler(QueryHandler[GetAllEventsQuery, GetAllEventsResult]):
    event_repository: EventRepository

    def _handle(self, query: GetAllEventsQuery) -> Result[GetAllEventsResult, Exception]:
        result = self.event_repository.get_all()

        if isinstance(result, Failure):
            logger.error("Error getting all events", extra={"error": str(result.failure())})
            return Failure(result.failure())

        return Success(GetAllEventsResult(events=[event.to_primitives() for event in result.unwrap()]))
