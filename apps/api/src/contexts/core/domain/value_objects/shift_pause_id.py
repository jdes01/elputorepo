import uuid
from dataclasses import dataclass
from src.contexts.shared import DomainError


class ShiftIdInvalidError(DomainError):
    pass


@dataclass(frozen=True)
class ShiftPauseId:
    value: str

    def __post_init__(self):
        self.validate()

    def validate(self):
        self._validate_valid_uuid()

    def _validate_valid_uuid(self):
        uuid.UUID(self.value)

    @staticmethod
    def generate() -> "ShiftPauseId":
        return ShiftPauseId(str(uuid.uuid4()))

    def is_valid(self) -> bool:
        try:
            self.validate()
            return True
        except DomainError:
            return False
