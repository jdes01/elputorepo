from dataclasses import dataclass

from src.apps.rest.utils.schemas import Schema
from src.contexts.core.domain.entities.pizza import PizzaPrimitives
from ...domain.repositories.pizza_repository import PizzaRepository
from src.contexts.shared.settings import Settings
from logger.main import get_logger


class GetPizzasQuery(Schema):
    pass

class GetPizzasResult(Schema):
    pizzas: list[PizzaPrimitives]


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

        pizzas_result = self.pizza_repository.get_all()

        if isinstance(pizzas_result, Exception):
            logger.error("Error fetching pizzas", error=str(pizzas_result))
            raise pizzas_result

        return GetPizzasResult(
            pizzas=[pizza.to_primitives() for pizza in pizzas_result]
        )
