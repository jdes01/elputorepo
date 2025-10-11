from fastapi import APIRouter, Depends

from src.apps.rest.core.companies.create_company.request import (
    CreateCompanyRequest,
    create_company_request,
)
from src.apps.rest.core.companies.create_company.response import CreateCompanyResponse
from src.apps.rest.utils.schemas import ResponseMetaSchema, ResponseSchema
from src.contexts.core.application.commands.create_company.command_handler import (
    CreateCompanyCommand,
    CreateCompanyCommandHandler,
)


class CreateCompanyController:
    create_company_command_handler: CreateCompanyCommandHandler

    def __init__(self, create_company_command_handler: CreateCompanyCommandHandler):
        self.create_company_command_handler = create_company_command_handler

    def connect(self, router: APIRouter) -> None:
        router.add_api_route(
            "/{company_id}",
            self.handle_request,
            methods=["POST"],
            summary="Create a new company",
            response_model=ResponseSchema[CreateCompanyResponse],
        )

    def handle_request(
        self, request: CreateCompanyRequest = Depends(create_company_request)
    ) -> ResponseSchema[CreateCompanyResponse]:
        create_company_result = self.create_company_command_handler.handle(
            CreateCompanyCommand(company_id=request.company_id, name=request.name)
        )

        return ResponseSchema[CreateCompanyResponse](
            data=CreateCompanyResponse(
                company=create_company_result.company,
            ),
            metadata=ResponseMetaSchema(count=1),
        )
