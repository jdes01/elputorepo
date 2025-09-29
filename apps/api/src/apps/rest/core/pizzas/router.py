from dataclasses import dataclass

from fastapi import APIRouter

from src.apps.rest.core.pizzas.create_pizza.controller import (
    CreatePizzaController,
)
from src.apps.rest.core.pizzas.get_pizzas.controller import (
    GetPizzasController,
)
from src.apps.rest.utils.router import Router


@dataclass
class PizzasRouter(Router):
    get_pizzas_controller: GetPizzasController
    create_pizza_controller: CreatePizzaController

    def connect(self) -> APIRouter:
        router = APIRouter()
        self.get_pizzas_controller.connect(router)
        self.create_pizza_controller.connect(router)
        return router
