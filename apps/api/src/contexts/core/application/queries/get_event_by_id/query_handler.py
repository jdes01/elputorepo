from dataclasses import dataclass

from logger.main import get_logger
from returns.result import Failure, Result, Success

from src.contexts.shared import QueryHandler, Schema

from ....domain import EventId, EventPrimitives, EventRepository

logger = get_logger(__name__)


class GetEventByIdQuery(Schema):
    event_id: str


class GetEventByIdResult(Schema):
    event: EventPrimitives | None


@dataclass
class GetEventByIdQueryHandler(QueryHandler[GetEventByIdQuery, GetEventByIdResult]):
    event_repository: EventRepository

    def _handle(self, query: GetEventByIdQuery) -> Result[GetEventByIdResult, Exception]:
        event_id = EventId(query.event_id)

        result = self.event_repository.get(event_id)

        match result:
            case Failure(error):
                logger.error("Error getting event by id", extra={"error": str(error)})
                return Failure(error)
            case Success(event):
                if event is None:
                    return Success(GetEventByIdResult(event=None))
                return Success(GetEventByIdResult(event=event.to_primitives()))
