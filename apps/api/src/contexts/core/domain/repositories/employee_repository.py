from abc import ABC, abstractmethod
from ..entities import Employee


class EmployeeRepository(ABC):
    @abstractmethod
    def save(self, employee: Employee) -> None | Exception:
        pass

    @abstractmethod
    def get_all(self) -> list[Employee] | Exception:
        pass
