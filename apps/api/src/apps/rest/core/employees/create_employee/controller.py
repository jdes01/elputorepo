from fastapi import APIRouter, Depends

from src.apps.rest.core.employees.create_employee.response import (
    CreateEmployeeResponse,
)
from src.apps.rest.core.employees.create_employee.request import (
    CreateEmployeeRequest,
    create_employee_request,
)
from src.apps.rest.utils.schemas import ResponseMetaSchema, ResponseSchema
from src.contexts.core.application.commands.create_employee_command_handler import (
    CreateEmployeeCommand,
    CreateEmployeeCommandHandler,
)


class CreateEmployeeController:
    create_employee_use_case: CreateEmployeeCommandHandler

    def __init__(self, create_employee_use_case: CreateEmployeeCommandHandler):
        self.create_employee_use_case = create_employee_use_case

    def connect(self, router: APIRouter) -> None:
        router.add_api_route(
            "/employee",
            self.handle_request,
            methods=["POST"],
            summary="Create a new employee",
            response_model=ResponseSchema[CreateEmployeeResponse],
        )

    def handle_request(
        self, request: CreateEmployeeRequest = Depends(create_employee_request)
    ) -> ResponseSchema[CreateEmployeeResponse]:
        create_employee_result = self.create_employee_use_case.handle(
            CreateEmployeeCommand(
                name=request.name,
            )
        )

        return ResponseSchema[CreateEmployeeResponse](
            data=CreateEmployeeResponse(
                employee=create_employee_result.employee,
            ),
            metadata=ResponseMetaSchema(count=1),
        )
