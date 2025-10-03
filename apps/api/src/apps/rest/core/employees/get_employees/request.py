from pydantic import BaseModel


class GetEmployeesRequest(BaseModel):
    pass


def get_employee_request() -> GetEmployeesRequest:
    return GetEmployeesRequest()
