from dataclasses import dataclass

from src.apps.rest.utils.schemas import Schema
from src.contexts.core.domain.entities.employee import Employee, EmployeePrimitives
from src.contexts.core.domain.value_objects.employee_name import EmployeeName
from ...domain.repositories.employee_repository import EmployeeRepository
from src.contexts.shared.settings import Settings
from logger.main import get_logger


class CreateEmployeeCommand(Schema):
    name: str


class CreateEmployeeResult(Schema):
    employee: EmployeePrimitives


logger = get_logger(__name__)


@dataclass
class CreateEmployeeCommandHandler:
    employee_repository: EmployeeRepository
    settings: Settings

    def handle(self, command: CreateEmployeeCommand) -> CreateEmployeeResult:
        logger.info(
            "Handling CreateEmployeeCommand",
            query=command.to_plain_values(),
            found_employees=[self.settings.app_name],
        )

        employee = Employee.create(name=EmployeeName(command.name))

        result = self.employee_repository.save(employee)

        if isinstance(result, Exception):
            raise result

        return CreateEmployeeResult(employee=employee.to_primitives())
