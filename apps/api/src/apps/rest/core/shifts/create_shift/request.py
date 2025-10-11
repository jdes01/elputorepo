from fastapi import Body, Path
from pydantic import BaseModel


class CreateShiftRequest(BaseModel):
    shift_id: str
    employee_id: str
    company_id: str


class CreateShiftBody(BaseModel):
    employee_id: str
    company_id: str


def create_shift_request(
    shift_id: str = Path(..., description="Shift ID from the URL"),
    body: CreateShiftBody = Body(...),
) -> CreateShiftRequest:
    return CreateShiftRequest(
        shift_id=shift_id, employee_id=body.employee_id, company_id=body.company_id
    )
