from fastapi import Body
from pydantic import BaseModel


class CreatePizzaRequest(BaseModel):
    name: str


class CreatePizzaBody(BaseModel):
    name: str


def create_pizza_request(
    body: CreatePizzaBody = Body(...),
) -> CreatePizzaRequest:
    return CreatePizzaRequest(
        name=body.name,
    )
