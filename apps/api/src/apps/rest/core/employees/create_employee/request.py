from fastapi import Body
from pydantic import BaseModel


class CreateEmployeeRequest(BaseModel):
    name: str


class CreateEmployeeBody(BaseModel):
    name: str


def create_employee_request(
    body: CreateEmployeeBody = Body(...),
) -> CreateEmployeeRequest:
    return CreateEmployeeRequest(
        name=body.name,
    )
