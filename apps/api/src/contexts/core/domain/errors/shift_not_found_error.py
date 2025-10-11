from src.contexts.shared.domain.exceptions.domain_error import DomainError


class ShiftNotFoundError(DomainError):
    def __init__(self, shift_id: str):
        self.shift_id = shift_id
        self.message = f"Shift '{self.shift_id}' not found"
        super().__init__(self.message)
