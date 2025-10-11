from fastapi import APIRouter, Depends

from src.apps.rest.core.employees.get_employees.request import (
    GetEmployeesRequest,
    get_employee_request,
)
from src.apps.rest.core.employees.get_employees.response import GetEmployeesResponse
from src.apps.rest.utils.schemas import ResponseMetaSchema, ResponseSchema
from src.contexts.core.application.queries.get_employees_query_handler import (
    GetEmployeesQuery,
    GetEmployeesQueryHandler,
)


class GetEmployeesController:
    get_employees_use_case: GetEmployeesQueryHandler

    def __init__(self, get_employees_use_case: GetEmployeesQueryHandler) -> None:
        self.get_employees_use_case = get_employees_use_case

    def connect(self, router: APIRouter) -> None:
        router.add_api_route(
            "/",
            self.handle_request,
            methods=["GET"],
            summary="Get all employees",
            response_model=ResponseSchema[GetEmployeesResponse],
        )

    def handle_request(
        self, request: GetEmployeesRequest = Depends(get_employee_request)
    ) -> ResponseSchema[GetEmployeesResponse]:
        result = self.get_employees_use_case.handle(GetEmployeesQuery())

        return ResponseSchema[GetEmployeesResponse](
            data=GetEmployeesResponse(
                employees=[employee for employee in result.employees]
            ),
            metadata=ResponseMetaSchema(count=len(result.employees)),
        )
