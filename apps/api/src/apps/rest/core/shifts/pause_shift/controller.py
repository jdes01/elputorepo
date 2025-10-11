from typing import Any
from fastapi import APIRouter, Depends

from src.apps.rest.core.shifts.pause_shift.request import (
    PauseShiftRequest,
    pause_shift_request,
)
from src.apps.rest.utils.schemas import (
    ResponseErrorSchema,
    ResponseMetaSchema,
    ResponseSchema,
)
from src.contexts.core.application.commands.pause_shift.command_handler import (
    PauseShiftCommand,
    PauseShiftCommandHandler,
    PauseShiftResult,
)


class PauseShiftController:
    pause_shift_command_handler: PauseShiftCommandHandler

    def __init__(self, pause_shift_command_handler: PauseShiftCommandHandler):
        self.pause_shift_command_handler = pause_shift_command_handler

    def connect(self, router: APIRouter) -> None:
        router.add_api_route(
            "/{shift_id}/pause",
            self.handle_request,
            methods=["POST"],
            summary="Pause a shift",
            response_model=ResponseSchema[PauseShiftResult],
        )

    def handle_request(
        self, request: PauseShiftRequest = Depends(pause_shift_request)
    ) -> ResponseSchema[PauseShiftResult]:
        try:
            pause_shift_result = self.pause_shift_command_handler.handle(
                PauseShiftCommand(shift_id=request.shift_id)
            )

            return ResponseSchema[PauseShiftResult](
                data=PauseShiftResult(
                    shift=pause_shift_result.shift,
                ),
                metadata=ResponseMetaSchema(count=1),
            )

        except Exception as e:
            return ResponseSchema[Any](
                message="Failure pausing shift",
                data=None,
                metadata=None,
                errors=[ResponseErrorSchema(code="400", message=str(e))],
            )
