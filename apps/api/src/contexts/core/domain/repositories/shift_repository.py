from abc import ABC, abstractmethod

from src.contexts.core.domain.entities.shift import Shift
from src.contexts.core.domain.value_objects.shift_id import ShiftId


class ShiftRepository(ABC):
    @abstractmethod
    def save(self, shift: Shift) -> None | Exception:
        pass

    @abstractmethod
    def get(self, shift_id: ShiftId) -> Shift | None | Exception:
        pass
