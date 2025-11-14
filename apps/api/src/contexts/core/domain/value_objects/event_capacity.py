from dataclasses import dataclass

from returns.result import Failure, Result, Success

from src.contexts.shared import DomainError


class EventCapacityInvalidError(DomainError):
    pass


@dataclass(frozen=True)
class EventCapacity:
    value: int

    def __post_init__(self) -> None:
        self.validate()

    def validate(self) -> None:
        self._validate_positive()

    def _validate_positive(self) -> None:
        if self.value <= 0:
            raise EventCapacityInvalidError(f"Event capacity must be greater than 0, got {self.value}")

    @staticmethod
    def try_create(value: int) -> Result["EventCapacity", DomainError]:
        """Try to create an EventCapacity, returning Result instead of raising exception."""
        try:
            return Success(EventCapacity(value))
        except EventCapacityInvalidError as e:
            return Failure(e)

    def is_valid(self) -> bool:
        try:
            self.validate()
            return True
        except DomainError:
            return False
