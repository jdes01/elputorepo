from src.contexts.shared.domain.exceptions.domain_error import DomainError


class EventNotFoundError(DomainError):
    def __init__(self, event_id: str):
        self.event_id = event_id
        self.message = f"Event '{self.event_id}' not found"
        super().__init__(self.message)
