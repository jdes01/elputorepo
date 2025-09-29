from dataclasses import dataclass

from src.apps.rest.utils.schemas import Schema
from ...domain.repositories.pizza_repository import PizzaRepository
from src.contexts.shared.settings import Settings
from logger.main import get_logger


class GetPizzasQuery(Schema):
    with_cheese: bool


class GetPizzasResult(Schema):
    pizzas: list[str]


logger = get_logger(__name__)


@dataclass
class GetPizzasQueryHandler:
    pizza_repository: PizzaRepository
    settings: Settings

    def handle(self, query: GetPizzasQuery) -> GetPizzasResult:
        logger.info(
            "Handling GetPizzasQuery",
            query=query.to_plain_values(),
            found_pizzas=[self.settings.app_name],
        )

        return GetPizzasResult(pizzas=[self.settings.app_name])
