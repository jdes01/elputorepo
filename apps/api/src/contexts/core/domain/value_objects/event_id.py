import uuid
from dataclasses import dataclass

from returns.result import Failure, Result, Success

from src.contexts.shared import DomainError


class EventIdInvalidError(DomainError):
    pass


@dataclass(frozen=True)
class EventId:
    value: str

    def __post_init__(self):
        self.validate()

    def validate(self):
        self._validate_valid_uuid()

    def _validate_valid_uuid(self):
        try:
            uuid.UUID(self.value)
        except ValueError as e:
            raise EventIdInvalidError(f"Invalid event ID format: {str(e)}")

    @staticmethod
    def generate() -> "EventId":
        return EventId(str(uuid.uuid4()))

    @staticmethod
    def try_create(value: str) -> Result["EventId", DomainError]:
        """Try to create an EventId, returning Result instead of raising exception."""
        try:
            return Success(EventId(value))
        except EventIdInvalidError as e:
            return Failure(e)
        except ValueError as e:
            return Failure(EventIdInvalidError(f"Invalid event ID format: {str(e)}"))

    def is_valid(self) -> bool:
        try:
            self.validate()
            return True
        except DomainError:
            return False
