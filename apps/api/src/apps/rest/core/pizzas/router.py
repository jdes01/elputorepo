from dataclasses import dataclass

from fastapi import APIRouter

from src.apps.rest.core.pizzas.controllers.get_pizzas_controller import (
    GetPizzasController,
)
from src.apps.rest.utils.router import Router


@dataclass
class PizzasRouter(Router):
    get_pizzas_controller: GetPizzasController

    def connect(self) -> APIRouter:
        router = APIRouter()
        self.get_pizzas_controller.connect(router)
        return router
