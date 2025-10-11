from dataclasses import dataclass

from src.apps.rest.utils.schemas import Schema
from src.contexts.core.domain.entities.company import Company, CompanyPrimitives
from src.contexts.core.domain.repositories.company_repository import CompanyRepository
from src.contexts.core.domain.value_objects.company_id import CompanyId
from src.contexts.core.domain.value_objects.company_name import CompanyName
from src.contexts.shared.settings import Settings
from logger.main import get_logger


class CreateCompanyCommand(Schema):
    company_id: str
    name: str


class CreateCompanyResult(Schema):
    company: CompanyPrimitives


logger = get_logger(__name__)


@dataclass
class CreateCompanyCommandHandler:
    company_repository: CompanyRepository
    settings: Settings

    def handle(self, command: CreateCompanyCommand) -> CreateCompanyResult:
        logger.info(
            "Handling CreateCompanyCommand",
            query=command.to_plain_values(),
            found_companys=[self.settings.app_name],
        )

        company = Company.create(
            id=CompanyId(command.company_id), name=CompanyName(command.name)
        )

        result = self.company_repository.save(company)

        if isinstance(result, Exception):
            raise result

        return CreateCompanyResult(company=company.to_primitives())
