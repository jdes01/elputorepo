from dataclasses import dataclass
from src.contexts.shared import DomainError


class CompanyNameEmptyError(DomainError):
    pass


class CompanyNameTooLongError(DomainError):
    pass


class CompanyNameInvalidCharactersError(DomainError):
    pass


@dataclass(frozen=True)
class CompanyName:
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
        except DomainError:
            return False

    def _validate_not_empty(self):
        if not self.value:
            raise CompanyNameEmptyError("El nombre de la Company no puede estar vacío.")

    def _validate_length(self):
        if len(self.value) > 50:
            raise CompanyNameTooLongError(
                "El nombre de la Company no puede superar 50 caracteres."
            )

    def _validate_characters(self):
        if not all(c.isalpha() or c.isspace() or c == "-" for c in self.value):
            raise CompanyNameInvalidCharactersError(
                "El nombre de la Company solo puede contener letras, espacios o guiones."
            )
