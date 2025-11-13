from pydantic import BaseModel

from src.contexts.core.domain.entities.user import UserPrimitives


class CreateUserResponse(BaseModel):
    user: UserPrimitives
