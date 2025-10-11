from dataclasses import dataclass
from datetime import datetime
from pydantic import BaseModel


from ..value_objects import ShiftPauseId, ShiftId, ShiftPauseStatus


class ShiftPausePrimitives(BaseModel):
    id: str
    shift_id: str
    status: str
    creation_datetime: datetime
    start_datetime: datetime | None = None
    end_datetime: datetime | None = None


@dataclass
class ShiftPause:
    id: ShiftPauseId
    shift_id: ShiftId
    status: ShiftPauseStatus
    creation_datetime: datetime
    start_datetime: datetime | None = None
    end_datetime: datetime | None = None

    @classmethod
    def create(cls, shift_id: ShiftId) -> "ShiftPause":
        return ShiftPause(
            id=ShiftPauseId.generate(),
            shift_id=shift_id,
            creation_datetime=datetime.now(),
            start_datetime=None,
            end_datetime=None,
            status=ShiftPauseStatus.PENDING,
        )

    @classmethod
    def from_primitives(cls, data: ShiftPausePrimitives) -> "ShiftPause":
        return ShiftPause(
            id=ShiftPauseId(data.id),
            shift_id=ShiftId(data.shift_id),
            status=ShiftPauseStatus(data.status),
            creation_datetime=data.creation_datetime,
            start_datetime=data.start_datetime,
            end_datetime=data.end_datetime,
        )

    def to_primitives(self) -> ShiftPausePrimitives:
        return ShiftPausePrimitives(
            id=self.id.value,
            shift_id=self.shift_id.value,
            status=self.status.value,
            creation_datetime=self.creation_datetime,
            start_datetime=self.start_datetime,
            end_datetime=self.end_datetime,
        )

    def start(self):
        if self.status != ShiftPauseStatus.PENDING:
            raise ValueError("Cannot start a pause that is not pending")

        self.start_datetime = datetime.now()
        self.status = ShiftPauseStatus.ONGOING

    def finish(self):
        if self.status not in [ShiftPauseStatus.ONGOING]:
            raise ValueError("Can only finish a started or paused pause")

        self.end_datetime = datetime.now()
        self.status = ShiftPauseStatus.FINISHED

    def reopen(self):
        if self.status != ShiftPauseStatus.FINISHED:
            raise ValueError("Can only reopen a finished pause")

        self.end_datetime = None
        self.status = ShiftPauseStatus.ONGOING
