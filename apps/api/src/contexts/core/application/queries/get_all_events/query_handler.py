from dataclasses import dataclass
from typing import List

from logger.main import get_logger
from returns.result import Failure, Result, Success

from src.contexts.shared import QueryHandler, Schema

from ....domain import EventPrimitives, EventRepository

logger = get_logger(__name__)


class GetAllEventsQuery(Schema):
    pass


class GetAllEventsResult(Schema):
    events: List[EventPrimitives]


@dataclass
class GetAllEventsQueryHandler(QueryHandler[GetAllEventsQuery, GetAllEventsResult]):
    event_repository: EventRepository

    def _handle(self, query: GetAllEventsQuery) -> Result[GetAllEventsResult, Exception]:
        result = self.event_repository.get_all()

        match result:
            case Failure(error):
                logger.error("Error getting all events", extra={"error": str(error)})
                return Failure(error)
            case Success(events):
                return Success(GetAllEventsResult(events=[event.to_primitives() for event in events]))
