from abc import ABC, abstractmethod
from ..entities import Pizza


class PizzaRepository(ABC):
    @abstractmethod
    def save(self, pizza: Pizza) -> None | Exception:
        pass
