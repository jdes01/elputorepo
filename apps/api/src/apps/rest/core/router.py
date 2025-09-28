from dataclasses import dataclass

from fastapi import APIRouter

from src.apps.rest.core.pizzas.router import PizzasRouter
from src.apps.rest.utils.router import Router


@dataclass
class CoreRouter(Router):
    pizzas_router: PizzasRouter

    def connect(self) -> APIRouter:
        router = APIRouter(tags=["Core"])
        router.include_router(self.pizzas_router.connect())
        return router
