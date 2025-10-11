from typing import Any
from fastapi import APIRouter, Depends, HTTPException

from src.apps.rest.core.employees.create_employee.response import (
    CreateEmployeeResponse,
)
from src.apps.rest.core.employees.create_employee.request import (
    CreateEmployeeRequest,
    create_employee_request,
)
from src.apps.rest.utils.schemas import (
    ResponseErrorSchema,
    ResponseMetaSchema,
    ResponseSchema,
)
from src.contexts.core.application.commands.create_employee.command_handler import (
    CreateEmployeeCommand,
    CreateEmployeeCommandHandler,
)
from src.contexts.shared.domain.exceptions.domain_error import DomainError


class CreateEmployeeController:
    create_employee_use_case: CreateEmployeeCommandHandler

    def __init__(self, create_employee_use_case: CreateEmployeeCommandHandler):
        self.create_employee_use_case = create_employee_use_case

    def connect(self, router: APIRouter) -> None:
        router.add_api_route(
            "/{employee_id}",
            self.handle_request,
            methods=["POST"],
            summary="Create a new employee",
            response_model=ResponseSchema[CreateEmployeeResponse],
        )

    def handle_request(
        self, request: CreateEmployeeRequest = Depends(create_employee_request)
    ) -> ResponseSchema[CreateEmployeeResponse]:
        try:
            create_employee_result = self.create_employee_use_case.handle(
                CreateEmployeeCommand(
                    employee_id=request.employee_id,
                    name=request.name,
                    company_id=request.company_id,
                )
            )

            if isinstance(create_employee_result, DomainError):
                return ResponseSchema[Any](
                    message="Company Creation Failed",
                    data=None,
                    errors=[
                        ResponseErrorSchema(
                            code="400", message=create_employee_result.message
                        )
                    ],
                )

            return ResponseSchema[CreateEmployeeResponse](
                data=CreateEmployeeResponse(
                    employee=create_employee_result.employee,
                ),
                metadata=ResponseMetaSchema(count=1),
            )
        except DomainError as e:
            raise HTTPException(status_code=500) from e
