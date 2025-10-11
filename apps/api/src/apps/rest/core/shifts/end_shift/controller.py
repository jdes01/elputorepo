from typing import Any
from fastapi import APIRouter, Depends

from src.apps.rest.core.shifts.end_shift.request import (
    EndShiftRequest,
    end_shift_request,
)
from src.apps.rest.utils.schemas import (
    ResponseErrorSchema,
    ResponseMetaSchema,
    ResponseSchema,
)
from src.contexts.core.application.commands.end_shift.command_handler import (
    EndShiftCommand,
    EndShiftCommandHandler,
    EndShiftResult,
)


class EndShiftController:
    end_shift_command_handler: EndShiftCommandHandler

    def __init__(self, end_shift_command_handler: EndShiftCommandHandler):
        self.end_shift_command_handler = end_shift_command_handler

    def connect(self, router: APIRouter) -> None:
        router.add_api_route(
            "/{shift_id}/end",
            self.handle_request,
            methods=["POST"],
            summary="End a shift",
            response_model=ResponseSchema[EndShiftResult],
        )

    def handle_request(
        self, request: EndShiftRequest = Depends(end_shift_request)
    ) -> ResponseSchema[EndShiftResult]:
        try:
            end_shift_result = self.end_shift_command_handler.handle(
                EndShiftCommand(shift_id=request.shift_id)
            )

            return ResponseSchema[EndShiftResult](
                data=EndShiftResult(
                    shift=end_shift_result.shift,
                ),
                metadata=ResponseMetaSchema(count=1),
            )

        except Exception as e:
            return ResponseSchema[Any](
                message="Failure ending shift",
                data=None,
                metadata=None,
                errors=[ResponseErrorSchema(code="400", message=str(e))],
            )
