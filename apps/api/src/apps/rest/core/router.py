from dataclasses import dataclass

from fastapi import APIRouter

from src.apps.rest.core.companies.router import CompaniesRouter
from src.apps.rest.core.employees.router import EmployeesRouter
from src.apps.rest.core.shifts.router import ShiftsRouter
from src.apps.rest.utils.router import Router


@dataclass
class CoreRouter(Router):
    employees_router: EmployeesRouter
    shifts_router: ShiftsRouter
    companies_router: CompaniesRouter

    def connect(self) -> APIRouter:
        router = APIRouter(tags=["Core"])
        router.include_router(self.employees_router.connect())
        router.include_router(self.shifts_router.connect())
        router.include_router(self.companies_router.connect())
        return router
