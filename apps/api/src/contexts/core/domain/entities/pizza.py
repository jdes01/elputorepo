from dataclasses import dataclass
from pydantic import BaseModel

from ..value_objects import PizzaName, PizzaId


class PizzaPrimitives(BaseModel):
    id: str
    name: str


@dataclass
class Pizza:
    id: PizzaId
    name: PizzaName

    @classmethod
    def create(cls, name: PizzaName) -> "Pizza":
        return Pizza(id=PizzaId.generate(), name=name)

    @classmethod
    def from_primitives(cls, data: PizzaPrimitives) -> "Pizza":
        return Pizza(id=PizzaId(data.id), name=PizzaName(data.name))

    def to_primitives(self) -> PizzaPrimitives:
        return PizzaPrimitives(id=self.id.value, name=self.name.value)
