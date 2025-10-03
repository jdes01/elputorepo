from dataclasses import dataclass
from src.contexts.shared import DomainException


class EmployeeNameEmptyError(DomainException):
    pass


class EmployeeNameTooLongError(DomainException):
    pass


class EmployeeNameInvalidCharactersError(DomainException):
    pass


@dataclass(frozen=True)
class EmployeeName:
    value: str

    def __post_init__(self):
        self.validate()

    def validate(self):
        self._validate_not_empty()
        self._validate_length()
        self._validate_characters()

    def is_valid(self) -> bool:
        try:
            self.validate()
            return True
        except DomainException:
            return False

    def _validate_not_empty(self):
        if not self.value:
            raise EmployeeNameEmptyError(
                "El nombre de la employee no puede estar vacío."
            )

    def _validate_length(self):
        if len(self.value) > 50:
            raise EmployeeNameTooLongError(
                "El nombre de la employee no puede superar 50 caracteres."
            )

    def _validate_characters(self):
        if not all(c.isalpha() or c.isspace() or c == "-" for c in self.value):
            raise EmployeeNameInvalidCharactersError(
                "El nombre de la employee solo puede contener letras, espacios o guiones."
            )
