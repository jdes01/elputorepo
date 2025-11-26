from dataclasses import dataclass


@dataclass(frozen=True)
class UserAge:
    value: int

    def __post_init__(self) -> None:
        self.validate()

    def validate(self) -> None:
        self._validate_valid_age()

    def _validate_valid_age(self) -> None:
        if self.age <= 0 or not isinstance(self.age, int):
            raise ValueError(f"Invalid age: {self.age}. Age must be greater than 0.")
