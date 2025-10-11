from src.contexts.shared.domain.exceptions.domain_error import DomainError


class CompanyNotFoundError(DomainError):
    def __init__(self, company_id: str):
        self.company_id = company_id
        self.message = f"Company '{self.company_id}' not found"
        super().__init__(self.message)
