from dataclasses import dataclass
from pydantic import BaseModel

from ..value_objects import EmployeeName, EmployeeId, CompanyId


class EmployeePrimitives(BaseModel):
    id: str
    name: str
    company_id: str


@dataclass
class Employee:
    id: EmployeeId
    name: EmployeeName
    company_id: CompanyId

    @classmethod
    def create(
        cls, id: EmployeeId, name: EmployeeName, company_id: CompanyId
    ) -> "Employee":
        return Employee(id=id, name=name, company_id=company_id)

    @classmethod
    def from_primitives(cls, data: EmployeePrimitives) -> "Employee":
        return Employee(
            id=EmployeeId(data.id),
            name=EmployeeName(data.name),
            company_id=CompanyId(data.company_id),
        )

    def to_primitives(self) -> EmployeePrimitives:
        return EmployeePrimitives(
            id=self.id.value, name=self.name.value, company_id=self.company_id.value
        )
