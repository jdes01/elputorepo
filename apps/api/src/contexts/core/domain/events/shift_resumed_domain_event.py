from dataclasses import dataclass
from src.contexts.core.domain.value_objects.shift_id import ShiftId
from src.contexts.core.domain.value_objects.shift_pause_id import ShiftPauseId
from src.contexts.shared.domain.domain_event import DomainEvent


@dataclass
class ShiftResumed(DomainEvent):
    shift_id: ShiftId
    pause_id: ShiftPauseId | None
