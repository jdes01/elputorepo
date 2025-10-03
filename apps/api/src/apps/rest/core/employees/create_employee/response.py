from src.apps.rest.utils.schemas import Schema
from src.contexts.core.domain.entities.employee import EmployeePrimitives


class CreateEmployeeResponse(Schema):
    employee: EmployeePrimitives
