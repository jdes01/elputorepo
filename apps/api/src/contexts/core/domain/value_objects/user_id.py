import uuid
from dataclasses import dataclass

from returns.result import Failure, Result, Success

from src.contexts.shared import DomainError


class UserIdInvalidError(DomainError):
    pass


@dataclass(frozen=True)
class UserId:
    value: str

    def __post_init__(self) -> None:
        self.validate()

    def validate(self) -> None:
        self._validate_valid_uuid()

    def _validate_valid_uuid(self) -> None:
        try:
            uuid.UUID(self.value)
        except ValueError as e:
            raise UserIdInvalidError(f"Invalid user ID format: {str(e)}") from e

    @staticmethod
    def generate() -> "UserId":
        return UserId(str(uuid.uuid4()))

    @staticmethod
    def try_create(value: str) -> Result["UserId", DomainError]:
        """Try to create a UserId, returning Result instead of raising exception."""
        try:
            return Success(UserId(value))
        except UserIdInvalidError as e:
            return Failure(e)
        except ValueError as e:
            return Failure(UserIdInvalidError(f"Invalid user ID format: {str(e)}"))

    def is_valid(self) -> bool:
        try:
            self.validate()
            return True
        except DomainError:
            return False
