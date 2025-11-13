from dataclasses import dataclass
from datetime import datetime

from pydantic import BaseModel

from src.contexts.core.domain.events.user_created_domain_event import UserCreated
from src.contexts.shared.domain.aggregate import Aggregate

from ..value_objects import UserEmail, UserId


class UserPrimitives(BaseModel):
    id: str
    email: str


@dataclass
class User(Aggregate):
    id: UserId
    email: UserEmail

    @classmethod
    def create(cls, id: UserId, email: UserEmail) -> "User":
        user = User(id=id, email=email)
        user.__on_user_created()
        return user

    def __on_user_created(self) -> None:
        self._add_domain_event(
            UserCreated(
                timestamp=datetime.now(),
                user_id=self.id,
                email=self.email,
            )
        )

    @classmethod
    def from_primitives(cls, data: UserPrimitives) -> "User":
        return User(
            id=UserId(data.id),
            email=UserEmail(data.email),
        )

    def to_primitives(self) -> UserPrimitives:
        return UserPrimitives(
            id=self.id.value,
            email=self.email.value,
        )
