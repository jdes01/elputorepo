from enum import Enum


class ShiftStatus(Enum):
    PENDING = "PENDING"
    ONGOING = "ONGOING"
    PAUSED = "PAUSED"
    COMPLETED = "FINISHED"
