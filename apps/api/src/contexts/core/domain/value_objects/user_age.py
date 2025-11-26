from dataclasses import dataclass


@dataclass(frozen=True)
class UserAge:
    value: int

    def __post_init__(self) -> None:
        self.validate()
