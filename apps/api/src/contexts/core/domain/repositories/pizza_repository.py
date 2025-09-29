from abc import ABC, abstractmethod
from ..entities import Pizza


class PizzaRepository(ABC):
    @abstractmethod
    def save(self, pizza: Pizza) -> None | Exception:
        pass

    @abstractmethod
    def get_all(self) -> list[Pizza] | Exception:
        pass
