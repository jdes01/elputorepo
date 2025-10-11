from typing import Any
from fastapi import APIRouter, Depends

from src.apps.rest.core.shifts.resume_shift.request import (
    ResumeShiftRequest,
    resume_shift_request,
)
from src.apps.rest.utils.schemas import (
    ResponseErrorSchema,
    ResponseMetaSchema,
    ResponseSchema,
)
from src.contexts.core.application.commands.resume_shift.command_handler import (
    ResumeShiftCommand,
    ResumeShiftCommandHandler,
    ResumeShiftResult,
)


class ResumeShiftController:
    resume_shift_command_handler: ResumeShiftCommandHandler

    def __init__(self, resume_shift_command_handler: ResumeShiftCommandHandler):
        self.resume_shift_command_handler = resume_shift_command_handler

    def connect(self, router: APIRouter) -> None:
        router.add_api_route(
            "/{shift_id}/resume",
            self.handle_request,
            methods=["POST"],
            summary="Resume shift",
            response_model=ResponseSchema[ResumeShiftResult],
        )

    def handle_request(
        self, request: ResumeShiftRequest = Depends(resume_shift_request)
    ) -> ResponseSchema[ResumeShiftResult]:
        try:
            resume_shift_result = self.resume_shift_command_handler.handle(
                ResumeShiftCommand(shift_id=request.shift_id)
            )

            return ResponseSchema[ResumeShiftResult](
                data=ResumeShiftResult(
                    shift=resume_shift_result.shift,
                ),
                metadata=ResponseMetaSchema(count=1),
            )

        except Exception as e:
            return ResponseSchema[Any](
                message="Failure resuming shift",
                data=None,
                metadata=None,
                errors=[ResponseErrorSchema(code="400", message=str(e))],
            )
