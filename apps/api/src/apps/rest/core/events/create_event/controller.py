from fastapi import APIRouter, Depends

from src.apps.rest.core.events.create_event.request import (
    CreateEventRequest,
    create_event_request,
)
from src.apps.rest.core.events.create_event.response import CreateEventResponse
from src.apps.rest.utils.schemas import ResponseMetaSchema, ResponseSchema
from src.contexts.core.application.commands.create_event.command_handler import (
    CreateEventCommand,
    CreateEventCommandHandler,
)


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

    def handle_request(
        self, request: CreateEventRequest = Depends(create_event_request)
    ) -> ResponseSchema[CreateEventResponse]:
        create_event_result = self.create_event_command_handler.handle(
            CreateEventCommand(event_id=request.event_id, name=request.name)
        )

        return ResponseSchema[CreateEventResponse](
            data=CreateEventResponse(
                event=create_event_result.event,
            ),
            metadata=ResponseMetaSchema(count=1),
        )
