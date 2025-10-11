from typing import Any
from fastapi import APIRouter, Depends

from src.apps.rest.core.shifts.start_shift.request import (
    StartShiftRequest,
    start_shift_request,
)
from src.apps.rest.core.shifts.start_shift.response import StartShiftResponse
from src.apps.rest.utils.schemas import (
    ResponseMetaSchema,
    ResponseSchema,
    ResponseErrorSchema,
)
from src.contexts.core.application.commands.start_shift.command_handler import (
    StartShiftCommand,
    StartShiftCommandHandler,
)


class StartShiftController:
    start_shift_command_handler: StartShiftCommandHandler

    def __init__(self, start_shift_command_handler: StartShiftCommandHandler):
        self.start_shift_command_handler = start_shift_command_handler

    def connect(self, router: APIRouter) -> None:
        router.add_api_route(
            "/{shift_id}/start",
            self.handle_request,
            methods=["POST"],
            summary="Start a shift",
            response_model=ResponseSchema[StartShiftResponse],
        )

    def handle_request(
        self, request: StartShiftRequest = Depends(start_shift_request)
    ) -> ResponseSchema[StartShiftResponse]:
        try:
            start_shift_result = self.start_shift_command_handler.handle(
                StartShiftCommand(shift_id=request.shift_id)
            )

            return ResponseSchema[StartShiftResponse](
                data=StartShiftResponse(
                    shift=start_shift_result.shift,
                ),
                metadata=ResponseMetaSchema(count=1),
            )
        except Exception as e:
            return ResponseSchema[Any](
                message="Failure starting shift",
                data=None,
                metadata=None,
                errors=[ResponseErrorSchema(code="400", message=str(e))],
            )
