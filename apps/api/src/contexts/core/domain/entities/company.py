from dataclasses import dataclass
from pydantic import BaseModel

from ..value_objects import CompanyName, CompanyId


class CompanyPrimitives(BaseModel):
    id: str
    name: str


@dataclass
class Company:
    id: CompanyId
    name: CompanyName

    @classmethod
    def create(cls, id: CompanyId, name: CompanyName) -> "Company":
        return Company(id=id, name=name)

    @classmethod
    def from_primitives(cls, data: CompanyPrimitives) -> "Company":
        return Company(
            id=CompanyId(data.id),
            name=CompanyName(data.name),
        )

    def to_primitives(self) -> CompanyPrimitives:
        return CompanyPrimitives(id=self.id.value, name=self.name.value)
