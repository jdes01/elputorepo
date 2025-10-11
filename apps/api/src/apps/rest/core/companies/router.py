from dataclasses import dataclass

from fastapi import APIRouter

from src.apps.rest.core.companies.create_company.controller import (
    CreateCompanyController,
)
from src.apps.rest.utils.router import Router


@dataclass
class CompaniesRouter(Router):
    create_company_controller: CreateCompanyController

    def connect(self) -> APIRouter:
        router = APIRouter(prefix="/companies")
        self.create_company_controller.connect(router)
        return router
