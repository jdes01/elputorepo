from typing import Annotated

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from src.apps.rest.utils.schemas import ResponseMetaSchema, ResponseSchema, Schema
from src.contexts.core.application.queries.get_pizzas_query_handler import (
    GetPizzasQuery,
    GetPizzasQueryHandler,
)


class GetPizzasRequest(BaseModel):
    with_cheese: bool


class GetPizzasResponse(Schema):
    names: list[str]


def get_pizza_request(
    with_cheese: Annotated[bool, Query(alias="withCheese")] = False,
) -> GetPizzasRequest:
    return GetPizzasRequest(with_cheese=with_cheese)


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
        result = self.get_pizzas_use_case.handle(
            GetPizzasQuery(with_cheese=request.with_cheese)
        )

        return ResponseSchema[GetPizzasResponse](
            data=GetPizzasResponse(names=[pizza for pizza in result.pizzas]),
            metadata=ResponseMetaSchema(count=len(result.pizzas)),
        )
