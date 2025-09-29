from dataclasses import dataclass

from src.apps.rest.utils.schemas import Schema
from src.contexts.core.domain.entities.pizza import Pizza, PizzaPrimitives
from src.contexts.core.domain.value_objects.pizza_name import PizzaName
from ...domain.repositories.pizza_repository import PizzaRepository
from src.contexts.shared.settings import Settings
from logger.main import get_logger


class CreatePizzaCommand(Schema):
    name: str


class CreatePizzaResult(Schema):
    pizza: PizzaPrimitives


logger = get_logger(__name__)


@dataclass
class CreatePizzaCommandHandler:
    pizza_repository: PizzaRepository
    settings: Settings

    def handle(self, command: CreatePizzaCommand) -> CreatePizzaResult:
        logger.info(
            "Handling CreatePizzaCommand",
            query=command.to_plain_values(),
            found_pizzas=[self.settings.app_name],
        )

        pizza = Pizza.create(name=PizzaName(command.name))

        result = self.pizza_repository.save(pizza)

        if isinstance(result, Exception):
            raise result

        return CreatePizzaResult(pizza=pizza.to_primitives())
