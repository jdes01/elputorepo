from dataclasses import dataclass
from datetime import datetime
from src.contexts.core.domain.value_objects.shift_id import ShiftId
from src.contexts.shared.domain.domain_event import DomainEvent


@dataclass
class ShiftEnded(DomainEvent):
    shift_id: ShiftId
    end_datetime: datetime
