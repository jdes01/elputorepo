from dataclasses import dataclass
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from src.contexts.core.domain.entities.employee import EmployeePrimitives, Employee
from ...domain.repositories.employee_repository import EmployeeRepository
from ..schemas import EmployeePostgresSchema
from logger.main import get_logger

logger = get_logger(__name__)

@dataclass
class PostgresEmployeeRepository(EmployeeRepository):
    session: Session

    def save(self, employee: Employee) -> None | Exception:
        try:
            with self.session.begin():
                new_employee = EmployeePostgresSchema(
                    employee_id=employee.id.value,
                    name=employee.name.value,
                    company_id=employee.company_id.value,
                )
                self.session.add(new_employee)
                self.session.flush()

                logger.info(
                    f"Employee saved with DB ID: {new_employee.id}, domain ID: {new_employee.employee_id}"
                )

                return None

        except SQLAlchemyError as e:
            logger.exception("Error saving employee")
            return e

    def get_all(self) -> list[Employee] | Exception:
        try:
            employees = self.session.query(EmployeePostgresSchema).all()
            return [
                Employee.from_primitives(
                    EmployeePrimitives(
                        id=employee.employee_id,  # type: ignore
                        name=employee.name,  # type: ignore
                        company_id=employee.company_id,  # type: ignore
                    )
                )
                for employee in employees
            ]
        except SQLAlchemyError as e:
            logger.exception("Error fetching employees")
            return e
