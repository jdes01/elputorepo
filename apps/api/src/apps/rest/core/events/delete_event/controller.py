from fastapi import APIRouter, HTTPException, Path, status
from returns.result import Success

from src.contexts.core.application.commands.delete_event.command_handler import (
    DeleteEventCommand,
    DeleteEventCommandHandler,
)
from src.contexts.shared.domain.schemas import ResponseMetaSchema, ResponseSchema
from src.contexts.shared.infrastructure.logging.logger import Logger


class DeleteEventController:
    delete_event_command_handler: DeleteEventCommandHandler
    logger: Logger

    def __init__(self, delete_event_command_handler: DeleteEventCommandHandler, logger: Logger):
        self.delete_event_command_handler = delete_event_command_handler
        self.logger = logger

    def connect(self, router: APIRouter) -> None:
        router.add_api_route(
            "/{event_id}",
            self.handle_request,
            methods=["DELETE"],
            summary="Delete an event (soft delete)",
            response_model=ResponseSchema[dict[str, bool]],
        )

    async def handle_request(self, event_id: str = Path(..., description="Event ID")) -> ResponseSchema[dict[str, bool]]:
        result = await self.delete_event_command_handler.handle(DeleteEventCommand(event_id=event_id))

        if isinstance(result, Success):
            return ResponseSchema[dict[str, bool]](
                data={"success": True},
                metadata=ResponseMetaSchema(count=1),
            )

        error = result.failure()

        self.logger.error("Error Deleting Event", extra={"error": str(error), "error_type": type(error).__name__})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
