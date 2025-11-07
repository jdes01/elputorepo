from dataclasses import dataclass

from src.contexts.shared.domain.domain_event import DomainEvent

from ..value_objects import UserEmail, UserId


@dataclass
class UserCreated(DomainEvent):
    user_id: UserId
    email: UserEmail
