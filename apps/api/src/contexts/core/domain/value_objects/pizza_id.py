import uuid
from dataclasses import dataclass
from src.contexts.shared import DomainException


class PizzaIdInvalidError(DomainException):
    pass


@dataclass(frozen=True)
class PizzaId:
    value: str

    def __post_init__(self):
        self.validate()

    def validate(self):
        self._validate_valid_uuid()

    def _validate_valid_uuid(self):
        uuid.UUID(self.value)

    @staticmethod
    def generate() -> "PizzaId":
        return PizzaId(str(uuid.uuid4()))

    def is_valid(self) -> bool:
        try:
            self.validate()
            return True
        except DomainException:
            return False
