from dataclasses import dataclass

from returns.result import Failure, Result, Success

from src.contexts.shared import DomainError


class EventNameEmptyError(DomainError):
    pass


class EventNameTooLongError(DomainError):
    pass


class EventNameInvalidCharactersError(DomainError):
    pass


@dataclass(frozen=True)
class EventName:
    value: str

    def __post_init__(self):
        self.validate()

    def validate(self):
        self._validate_not_empty()
        self._validate_length()
        self._validate_characters()

    @staticmethod
    def try_create(value: str) -> Result["EventName", DomainError]:
        """Try to create an EventName, returning Result instead of raising exception."""
        try:
            return Success(EventName(value))
        except DomainError as e:
            return Failure(e)

    def is_valid(self) -> bool:
        try:
            self.validate()
            return True
        except DomainError:
            return False

    def _validate_not_empty(self):
        if not self.value:
            raise EventNameEmptyError("Event name cannot be empty.")

    def _validate_length(self):
        if len(self.value) > 50:
            raise EventNameTooLongError("Event name cannot be longer than 50 characters.")

    def _validate_characters(self):
        if not all(c.isalpha() or c.isspace() or c == "-" for c in self.value):
            raise EventNameInvalidCharactersError("Event name can only contain letters, spaces or hyphens.")
