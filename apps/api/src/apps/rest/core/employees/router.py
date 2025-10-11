from dataclasses import dataclass

from fastapi import APIRouter

from src.apps.rest.core.employees.create_employee.controller import (
    CreateEmployeeController,
)
from src.apps.rest.core.employees.get_employees.controller import (
    GetEmployeesController,
)
from src.apps.rest.utils.router import Router


@dataclass
class EmployeesRouter(Router):
    get_employees_controller: GetEmployeesController
    create_employee_controller: CreateEmployeeController

    def connect(self) -> APIRouter:
        router = APIRouter(prefix="/employees")
        self.get_employees_controller.connect(router)
        self.create_employee_controller.connect(router)
        return router
