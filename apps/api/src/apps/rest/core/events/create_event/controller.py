from fastapi import APIRouter, Depends, HTTPException, status
from logger.main import get_logger
from returns.result import Success

from src.apps.rest.core.events.create_event.request import (
    CreateEventRequest,
    create_event_request,
)
from src.apps.rest.core.events.create_event.response import CreateEventResponse
from src.contexts.core.application.commands.create_event.command_handler import (
    CreateEventCommand,
    CreateEventCommandHandler,
)
from src.contexts.shared import DomainError
from src.contexts.shared.domain.schemas import ResponseMetaSchema, ResponseSchema

logger = get_logger(__name__)

CREATE_EVENT_REQUEST = Depends(create_event_request)


class CreateEventController:
    create_event_command_handler: CreateEventCommandHandler

    def __init__(self, create_event_command_handler: CreateEventCommandHandler):
        self.create_event_command_handler = create_event_command_handler

    def connect(self, router: APIRouter) -> None:
        router.add_api_route(
            "/{event_id}",
            self.handle_request,
            methods=["POST"],
            summary="Create a new event",
            response_model=ResponseSchema[CreateEventResponse],
        )

    async def handle_request(self, request: CreateEventRequest = CREATE_EVENT_REQUEST) -> ResponseSchema[CreateEventResponse]:
        result = await self.create_event_command_handler.handle(CreateEventCommand(event_id=request.event_id, name=request.name, capacity=request.capacity))

        if isinstance(result, Success):
            return ResponseSchema[CreateEventResponse](
                data=CreateEventResponse(event=result.unwrap().event),
                metadata=ResponseMetaSchema(count=1),
            )

        if isinstance(result.failure(), DomainError):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(result.failure()))

        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
