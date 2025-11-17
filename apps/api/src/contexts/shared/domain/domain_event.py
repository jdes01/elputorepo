from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime


@dataclass(kw_only=True)
class DomainEvent(ABC):
    timestamp: datetime = field(default_factory=datetime.now)

    @property
    @abstractmethod
    def EVENT_NAME(self) -> str: ...
