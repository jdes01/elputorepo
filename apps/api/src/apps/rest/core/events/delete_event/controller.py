from fastapi import APIRouter, HTTPException, Path, status
from logger.main import get_logger
from returns.result import Failure, Success

from src.contexts.core.application.commands.delete_event.command_handler import (
    DeleteEventCommand,
    DeleteEventCommandHandler,
)
from src.contexts.core.domain.errors.event_not_found_error import EventNotFoundError
from src.contexts.shared.domain.schemas import ResponseMetaSchema, ResponseSchema

logger = get_logger(__name__)


class DeleteEventController:
    delete_event_command_handler: DeleteEventCommandHandler

    def __init__(self, delete_event_command_handler: DeleteEventCommandHandler):
        self.delete_event_command_handler = delete_event_command_handler

    def connect(self, router: APIRouter) -> None:
        router.add_api_route(
            "/{event_id}",
            self.handle_request,
            methods=["DELETE"],
            summary="Delete an event (soft delete)",
            response_model=ResponseSchema[dict],
        )

    def handle_request(
        self, event_id: str = Path(..., description="Event ID")
    ) -> ResponseSchema[dict]:
        result = self.delete_event_command_handler.handle(
            DeleteEventCommand(event_id=event_id)
        )

        match result:
            case Success(_):
                return ResponseSchema[dict](
                    data={"success": True},
                    metadata=ResponseMetaSchema(count=1),
                )
            case Failure(error):
                if isinstance(error, EventNotFoundError):
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=error.message,
                    )
                logger.error(
                    "Error al eliminar evento",
                    extra={"error": str(error), "error_type": type(error).__name__},
                )
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Internal server error",
                )
