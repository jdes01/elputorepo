from fastapi import APIRouter, HTTPException, status
from logger.main import get_logger
from returns.result import Failure, Success

from src.contexts.core.application.queries.get_all_events.query_handler import (
    GetAllEventsQuery,
    GetAllEventsQueryHandler,
    GetAllEventsResult,
)
from src.contexts.shared.domain.schemas import ResponseMetaSchema, ResponseSchema

logger = get_logger(__name__)


class GetAllEventsController:
    get_all_events_query_handler: GetAllEventsQueryHandler

    def __init__(self, get_all_events_query_handler: GetAllEventsQueryHandler):
        self.get_all_events_query_handler = get_all_events_query_handler

    def connect(self, router: APIRouter) -> None:
        router.add_api_route(
            "",
            self.handle_request,
            methods=["GET"],
            summary="Get all events",
            response_model=ResponseSchema[GetAllEventsResult],
        )

    def handle_request(self) -> ResponseSchema[GetAllEventsResult]:
        result = self.get_all_events_query_handler.handle(GetAllEventsQuery())

        match result:
            case Success(value):
                return ResponseSchema[GetAllEventsResult](
                    data=value,
                    metadata=ResponseMetaSchema(count=len(value.events)),
                )
            case Failure(_):
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Internal server error",
                )
