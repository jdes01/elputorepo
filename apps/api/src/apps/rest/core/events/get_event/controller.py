from fastapi import APIRouter, HTTPException, Path, status
from logger.main import get_logger
from returns.result import Success

from src.contexts.core.application.queries.get_event_by_id.query_handler import (
    GetEventByIdQuery,
    GetEventByIdQueryHandler,
    GetEventByIdResult,
)
from src.contexts.core.domain.errors.event_not_found_error import EventNotFoundError
from src.contexts.shared.domain.schemas import ResponseMetaSchema, ResponseSchema

logger = get_logger(__name__)


class GetEventController:
    get_event_by_id_query_handler: GetEventByIdQueryHandler

    def __init__(self, get_event_by_id_query_handler: GetEventByIdQueryHandler):
        self.get_event_by_id_query_handler = get_event_by_id_query_handler

    def connect(self, router: APIRouter) -> None:
        router.add_api_route(
            "/{event_id}",
            self.handle_request,
            methods=["GET"],
            summary="Get an event by ID",
            response_model=ResponseSchema[GetEventByIdResult],
        )

    def handle_request(self, event_id: str = Path(..., description="Event ID")) -> ResponseSchema[GetEventByIdResult]:
        result = self.get_event_by_id_query_handler.handle(GetEventByIdQuery(event_id=event_id))

        if isinstance(result, Success):
            return ResponseSchema[GetEventByIdResult](
                data=result.unwrap(),
                metadata=ResponseMetaSchema(count=1),
            )

        error = result.failure()

        if isinstance(error, EventNotFoundError):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error.message,
            )
        logger.error(
            "Error al obtener evento",
            extra={"error": str(error), "error_type": type(error).__name__},
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
