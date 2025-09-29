from fastapi import APIRouter, Depends

from src.apps.rest.core.pizzas.create_pizza.response import (
    CreatePizzaResponse,
)
from src.apps.rest.core.pizzas.create_pizza.request import (
    CreatePizzaRequest,
    create_pizza_request,
)
from src.apps.rest.utils.schemas import ResponseMetaSchema, ResponseSchema
from src.contexts.core.application.commands.create_pizza_command_handler import (
    CreatePizzaCommand,
    CreatePizzaCommandHandler,
)


class CreatePizzaController:
    create_pizza_use_case: CreatePizzaCommandHandler

    def __init__(self, create_pizza_use_case: CreatePizzaCommandHandler):
        self.create_pizza_use_case = create_pizza_use_case

    def connect(self, router: APIRouter) -> None:
        router.add_api_route(
            "/pizza",
            self.handle_request,
            methods=["POST"],
            summary="Create a new pizza",
            response_model=ResponseSchema[CreatePizzaResponse],
        )

    def handle_request(
        self, request: CreatePizzaRequest = Depends(create_pizza_request)
    ) -> ResponseSchema[CreatePizzaResponse]:
        create_pizza_result = self.create_pizza_use_case.handle(
            CreatePizzaCommand(
                name=request.name,
            )
        )

        return ResponseSchema[CreatePizzaResponse](
            data=CreatePizzaResponse(
                pizza=create_pizza_result.pizza,
            ),
            metadata=ResponseMetaSchema(count=1),
        )
