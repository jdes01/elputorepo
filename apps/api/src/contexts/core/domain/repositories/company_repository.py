from abc import ABC, abstractmethod

from src.contexts.core.domain.value_objects.company_id import CompanyId
from ..entities import Company


class CompanyRepository(ABC):
    @abstractmethod
    def save(self, company: Company) -> None | Exception:
        pass

    @abstractmethod
    def get(self, company_id: CompanyId) -> Company | None | Exception:
        pass
