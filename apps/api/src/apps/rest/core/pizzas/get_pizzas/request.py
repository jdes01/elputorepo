from pydantic import BaseModel


class GetPizzasRequest(BaseModel):
    pass


def get_pizza_request() -> GetPizzasRequest:
    return GetPizzasRequest()
