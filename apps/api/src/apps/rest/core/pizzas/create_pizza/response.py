from src.apps.rest.utils.schemas import Schema
from src.contexts.core.domain.entities.pizza import PizzaPrimitives


class CreatePizzaResponse(Schema):
    pizza: PizzaPrimitives
