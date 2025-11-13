from abc import ABC, abstractmethod

from returns.result import Result

from src.contexts.core.domain.entities.user import User


class UserRepository(ABC):
    @abstractmethod
    def save(self, user: User) -> Result[None, Exception]:
        pass

    @abstractmethod
    def find_by_id(self, user_id) -> Result[User | None, Exception]:
        pass
