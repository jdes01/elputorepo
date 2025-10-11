from enum import Enum


class ShiftPauseStatus(Enum):
    PENDING = "PENDING"
    ONGOING = "ONGOING"
    FINISHED = "FINISHED"
