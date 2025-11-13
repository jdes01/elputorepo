import re
from dataclasses import dataclass

from returns.result import Failure, Result, Success

from src.contexts.shared import DomainError


class UserEmailInvalidError(DomainError):
    pass


@dataclass(frozen=True)
class UserEmail:
    value: str

    def __post_init__(self):
        self.validate()

    def validate(self):
        self._validate_email_format()

    def _validate_email_format(self):
        email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(email_pattern, self.value):
            raise UserEmailInvalidError(f"Invalid email format: {self.value}")

    @staticmethod
    def try_create(value: str) -> Result["UserEmail", DomainError]:
        """Try to create a UserEmail, returning Result instead of raising exception."""
        try:
            return Success(UserEmail(value))
        except UserEmailInvalidError as e:
            return Failure(e)

    def is_valid(self) -> bool:
        try:
            self.validate()
            return True
        except DomainError:
            return False
