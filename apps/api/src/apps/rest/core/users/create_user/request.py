from fastapi import Body, Path
from pydantic import BaseModel


class CreateUserRequest(BaseModel):
    user_id: str
    email: str


class CreateUserBody(BaseModel):
    email: str


CREATE_USER_DEFAULT_BODY = Body(...)


def create_user_request(
    user_id: str = Path(..., description="User ID from the URL"),
    body: CreateUserBody = CREATE_USER_DEFAULT_BODY,
) -> CreateUserRequest:
    return CreateUserRequest(user_id=user_id, email=body.email)
