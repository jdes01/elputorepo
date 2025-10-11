from dataclasses import dataclass
from datetime import datetime
from pydantic import BaseModel

from src.contexts.core.domain.events.shift_created_domain_event import ShiftCreated
from src.contexts.core.domain.events.shift_ended_domain_event import ShiftEnded
from src.contexts.core.domain.events.shift_paused_domain_event import ShiftPaused
from src.contexts.core.domain.events.shift_resumed_domain_event import ShiftResumed
from src.contexts.core.domain.events.shift_started_domain_event import ShiftStarted
from src.contexts.core.domain.value_objects.shift_pause_id import ShiftPauseId
from src.contexts.shared.domain.aggregate import Aggregate

from ..value_objects import (
    ShiftId,
    ShiftStatus,
    EmployeeId,
    CompanyId,
    ShiftPauseStatus,
)
from .shift_pause import ShiftPause, ShiftPausePrimitives


class ShiftPrimitives(BaseModel):
    id: str
    status: str
    pauses: list[ShiftPausePrimitives]
    employee_id: str
    company_id: str
    start_datetime: datetime | None = None
    end_datetime: datetime | None = None


@dataclass
class Shift(Aggregate):
    id: ShiftId
    employee_id: EmployeeId
    company_id: CompanyId
    status: ShiftStatus
    pauses: list[ShiftPause]
    start_datetime: datetime | None = None
    end_datetime: datetime | None = None

    @classmethod
    def create(
        cls, id: ShiftId, employee_id: EmployeeId, company_id: CompanyId
    ) -> "Shift":
        shift = Shift(
            id=id,
            employee_id=employee_id,
            company_id=company_id,
            pauses=[],
            status=ShiftStatus.PENDING,
            start_datetime=None,
            end_datetime=None,
        )

        shift.__on_shift_created()

        return shift

    def __on_shift_created(self) -> None:
        self._add_event(
            ShiftCreated(
                timestamp=datetime.now(),
                shift_id=self.id,
                employee_id=self.employee_id,
                company_id=self.company_id,
            )
        )

    @classmethod
    def from_primitives(cls, data: ShiftPrimitives) -> "Shift":
        return Shift(
            id=ShiftId(data.id),
            employee_id=EmployeeId(data.employee_id),
            company_id=CompanyId(data.company_id),
            status=ShiftStatus(data.status),
            pauses=[ShiftPause.from_primitives(p) for p in data.pauses],
            start_datetime=data.start_datetime,
            end_datetime=data.end_datetime,
        )

    def to_primitives(self) -> ShiftPrimitives:
        return ShiftPrimitives(
            id=self.id.value,
            employee_id=self.employee_id.value,
            company_id=self.company_id.value,
            status=self.status.value,
            pauses=[p.to_primitives() for p in self.pauses],
            start_datetime=self.start_datetime,
            end_datetime=self.end_datetime,
        )

    def start(self) -> None:
        if self.status != ShiftStatus.PENDING:
            raise Exception("Shift already started")

        self.start_datetime = datetime.now()
        self.status = ShiftStatus.ONGOING
        self.__on_shift_started()

    def __on_shift_started(self) -> None:
        self._add_event(
            ShiftStarted(
                timestamp=datetime.now(),
                shift_id=self.id,
                employee_id=self.employee_id,
                company_id=self.company_id,
            )
        )

    def pause(self) -> None:
        if self.status != ShiftStatus.ONGOING:
            raise Exception("Shift is not started")

        new_pause = ShiftPause.create(shift_id=self.id)
        new_pause.start()
        self.pauses.append(new_pause)
        self.status = ShiftStatus.PAUSED

        self.__on_shift_paused(new_pause.id)

    def __on_shift_paused(self, pause_id: ShiftPauseId) -> None:
        self._add_event(
            ShiftPaused(
                timestamp=datetime.now(),
                shift_id=self.id,
                pause_id=pause_id,
            )
        )

    def resume(self) -> None:
        match self.status:
            case ShiftStatus.PAUSED:
                self._resume_from_paused()
            case ShiftStatus.COMPLETED:
                self._resume_from_completed()
            case _:
                raise Exception(
                    "Shift cannot be resumed unless it is paused or completed"
                )

    def _resume_from_completed(self) -> None:
        self.status = ShiftStatus.ONGOING
        self.__on_shift_resumed(None)

    def _resume_from_paused(self) -> None:
        if not self.pauses or self.pauses[-1].status != ShiftPauseStatus.ONGOING:
            raise Exception("Cannot resume shift: no ongoing pause found")

        self.pauses[-1].finish()
        self.status = ShiftStatus.ONGOING
        self.__on_shift_resumed(self.pauses[-1].id)

    def __on_shift_resumed(self, pause_id: ShiftPauseId | None) -> None:
        self._add_event(
            ShiftResumed(
                timestamp=datetime.now(),
                shift_id=self.id,
                pause_id=pause_id,
            )
        )

    def end(self) -> None:
        if self.status not in [ShiftStatus.ONGOING, ShiftStatus.PAUSED]:
            raise Exception("Shift is not ongoing or paused")

        if self.pauses and self.pauses[-1].status is ShiftPauseStatus.ONGOING:
            self.pauses[-1].finish()

        self.status = ShiftStatus.COMPLETED
        self.end_datetime = datetime.now()

        self.__on_shift_ended(self.end_datetime)

    def __on_shift_ended(self, end_datetime: datetime) -> None:
        self._add_event(
            ShiftEnded(
                timestamp=datetime.now(),
                shift_id=self.id,
                end_datetime=end_datetime,
            )
        )
