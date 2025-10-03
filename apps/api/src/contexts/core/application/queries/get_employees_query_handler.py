from dataclasses import dataclass

from src.apps.rest.utils.schemas import Schema
from src.contexts.core.domain.entities.employee import EmployeePrimitives
from ...domain.repositories.employee_repository import EmployeeRepository
from src.contexts.shared.settings import Settings
from logger.main import get_logger


class GetEmployeesQuery(Schema):
    pass

class GetEmployeesResult(Schema):
    employees: list[EmployeePrimitives]


logger = get_logger(__name__)


@dataclass
class GetEmployeesQueryHandler:
    employee_repository: EmployeeRepository
    settings: Settings

    def handle(self, query: GetEmployeesQuery) -> GetEmployeesResult:
        logger.info(
            "Handling GetEmployeesQuery",
            query=query.to_plain_values(),
            found_employees=[self.settings.app_name],
        )

        employees_result = self.employee_repository.get_all()

        if isinstance(employees_result, Exception):
            logger.error("Error fetching employees", error=str(employees_result))
            raise employees_result

        return GetEmployeesResult(
            employees=[employee.to_primitives() for employee in employees_result]
        )
