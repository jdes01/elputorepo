from fastapi import APIRouter, Depends

from src.apps.rest.core.pizzas.get_pizzas.request import (
    GetPizzasRequest,
    get_pizza_request,
)
from src.apps.rest.core.pizzas.get_pizzas.response import GetPizzasResponse
from src.apps.rest.utils.schemas import ResponseMetaSchema, ResponseSchema
from src.contexts.core.application.queries.get_pizzas_query_handler import (
    GetPizzasQuery,
    GetPizzasQueryHandler,
)


class GetPizzasController:
    get_pizzas_use_case: GetPizzasQueryHandler

    def __init__(self, get_pizzas_use_case: GetPizzasQueryHandler) -> None:
        self.get_pizzas_use_case = get_pizzas_use_case

    def connect(self, router: APIRouter) -> None:
        router.add_api_route(
            "/pizzas",
            self.handle_request,
            methods=["GET"],
            summary="Get all pizzas",
            response_model=ResponseSchema[GetPizzasResponse],
        )

    def handle_request(
        self, request: GetPizzasRequest = Depends(get_pizza_request)
    ) -> ResponseSchema[GetPizzasResponse]:
        result = self.get_pizzas_use_case.handle(GetPizzasQuery())

        return ResponseSchema[GetPizzasResponse](
            data=GetPizzasResponse(pizzas=[pizza for pizza in result.pizzas]),
            metadata=ResponseMetaSchema(count=len(result.pizzas)),
        )
