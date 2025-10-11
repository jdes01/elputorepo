from dataclasses import dataclass

from src.apps.rest.utils.schemas import Schema
from src.contexts.core.domain.entities.employee import Employee, EmployeePrimitives
from src.contexts.core.domain.errors.company_not_found_error import CompanyNotFoundError
from src.contexts.core.domain.repositories.company_repository import CompanyRepository
from src.contexts.core.domain.value_objects.company_id import CompanyId
from src.contexts.core.domain.value_objects.employee_id import EmployeeId
from src.contexts.core.domain.value_objects.employee_name import EmployeeName
from src.contexts.shared.domain.exceptions.domain_error import DomainError
from ....domain.repositories.employee_repository import EmployeeRepository
from src.contexts.shared.settings import Settings
from logger.main import get_logger


class CreateEmployeeCommand(Schema):
    employee_id: str
    name: str
    company_id: str


class CreateEmployeeResult(Schema):
    employee: EmployeePrimitives


logger = get_logger(__name__)


@dataclass
class CreateEmployeeCommandHandler:
    employee_repository: EmployeeRepository
    company_repository: CompanyRepository
    settings: Settings

    def handle(
        self, command: CreateEmployeeCommand
    ) -> CreateEmployeeResult | DomainError:
        logger.info(
            "Handling CreateEmployeeCommand",
            query=command.to_plain_values(),
            found_employees=[self.settings.app_name],
        )

        result = self.company_repository.get(
            company_id=(company_id := CompanyId(command.company_id))
        )

        if isinstance(result, Exception):
            raise result

        if result is None:
            return CompanyNotFoundError(company_id=command.company_id)

        employee = Employee.create(
            id=EmployeeId(command.employee_id),
            name=EmployeeName(command.name),
            company_id=company_id,
        )

        result = self.employee_repository.save(employee)

        if isinstance(result, Exception):
            raise result

        return CreateEmployeeResult(employee=employee.to_primitives())
