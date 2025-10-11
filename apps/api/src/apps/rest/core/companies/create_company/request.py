from fastapi import Body, Path
from pydantic import BaseModel


class CreateCompanyRequest(BaseModel):
    company_id: str
    name: str


class CreateCompanyBody(BaseModel):
    name: str


def create_company_request(
    company_id: str = Path(..., description="Company ID from the URL"),
    body: CreateCompanyBody = Body(...),
) -> CreateCompanyRequest:
    return CreateCompanyRequest(company_id=company_id, name=body.name)
