from src.apps.rest.utils.schemas import Schema
from src.contexts.core.domain.entities.company import CompanyPrimitives


class CreateCompanyResponse(Schema):
    company: CompanyPrimitives
