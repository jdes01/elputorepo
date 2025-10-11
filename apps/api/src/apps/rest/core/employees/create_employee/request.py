from fastapi import Body, Path
from pydantic import BaseModel


class CreateEmployeeRequest(BaseModel):
    employee_id: str
    name: str
    company_id: str


class CreateEmployeeBody(BaseModel):
    name: str
    company_id: str


def create_employee_request(
    employee_id: str = Path(..., description="Employee ID from the URL"),
    body: CreateEmployeeBody = Body(...),
) -> CreateEmployeeRequest:
    return CreateEmployeeRequest(
        employee_id=employee_id, name=body.name, company_id=body.company_id
    )
