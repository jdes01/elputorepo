from typing import Any
from fastapi import APIRouter, Depends

from src.apps.rest.core.shifts.create_shift.response import (
    CreateShiftResponse,
)
from src.apps.rest.core.shifts.create_shift.request import (
    CreateShiftRequest,
    create_shift_request,
)
from src.apps.rest.utils.schemas import (
    ResponseErrorSchema,
    ResponseMetaSchema,
    ResponseSchema,
)
from src.contexts.core.application.commands.create_shift.command_handler import (
    CreateShiftCommand,
    CreateShiftCommandHandler,
)
from src.contexts.shared.domain.exceptions.domain_error import DomainError


class CreateShiftController:
    create_shift_command_handler: CreateShiftCommandHandler

    def __init__(self, create_shift_command_handler: CreateShiftCommandHandler):
        self.create_shift_command_handler = create_shift_command_handler

    def connect(self, router: APIRouter) -> None:
        router.add_api_route(
            "/{shift_id}",
            self.handle_request,
            methods=["POST"],
            summary="Create a new shift",
            response_model=ResponseSchema[CreateShiftResponse],
        )

    def handle_request(
        self, request: CreateShiftRequest = Depends(create_shift_request)
    ) -> ResponseSchema[CreateShiftResponse]:
        try:
            create_shift_result = self.create_shift_command_handler.handle(
                CreateShiftCommand(
                    shift_id=request.shift_id,
                    employee_id=request.employee_id,
                    company_id=request.company_id,
                )
            )

            return ResponseSchema[CreateShiftResponse](
                data=CreateShiftResponse(
                    shift=create_shift_result.shift,
                ),
                metadata=ResponseMetaSchema(count=1),
            )

        except Exception as e:
            return ResponseSchema[Any](
                message="Failure creating shift",
                data=None,
                metadata=None,
                errors=[ResponseErrorSchema(code="400", message=str(e))],
            )
