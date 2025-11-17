from dataclasses import dataclass

from src.contexts.shared.domain.domain_event import DomainEvent

from ..value_objects import UserEmail, UserId


@dataclass(kw_only=True)
class UserCreatedDomainEvent(DomainEvent):
    user_id: UserId
    email: UserEmail

    @property
    def EVENT_NAME(self) -> str:
        return "api.user_created"
