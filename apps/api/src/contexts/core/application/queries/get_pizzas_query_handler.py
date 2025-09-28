from dataclasses import dataclass

from src.apps.rest.utils.schemas import Schema
from ...domain.repositories.pizza_repository import PizzaRepository
from src.contexts.shared.settings import Settings


class GetPizzasQuery(Schema):
    with_cheese: bool


class GetPizzasResult(Schema):
    pizzas: list[str]


@dataclass
class GetPizzasQueryHandler:
    pizza_repository: PizzaRepository
    settings: Settings

    def handle(self, query: GetPizzasQuery) -> GetPizzasResult:
        return GetPizzasResult(pizzas=[self.settings.app_name])
