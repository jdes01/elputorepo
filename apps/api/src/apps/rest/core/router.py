from dataclasses import dataclass

from fastapi import APIRouter

from src.apps.rest.core.employees.router import EmployeesRouter
from src.apps.rest.utils.router import Router


@dataclass
class CoreRouter(Router):
    employees_router: EmployeesRouter

    def connect(self) -> APIRouter:
        router = APIRouter(tags=["Core"])
        router.include_router(self.employees_router.connect())
        return router
