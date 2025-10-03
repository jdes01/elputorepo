from dataclasses import dataclass
from pydantic import BaseModel

from ..value_objects import EmployeeName, EmployeeId


class EmployeePrimitives(BaseModel):
    id: str
    name: str


@dataclass
class Employee:
    id: EmployeeId
    name: EmployeeName

    @classmethod
    def create(cls, name: EmployeeName) -> "Employee":
        return Employee(id=EmployeeId.generate(), name=name)

    @classmethod
    def from_primitives(cls, data: EmployeePrimitives) -> "Employee":
        return Employee(id=EmployeeId(data.id), name=EmployeeName(data.name))

    def to_primitives(self) -> EmployeePrimitives:
        return EmployeePrimitives(id=self.id.value, name=self.name.value)
