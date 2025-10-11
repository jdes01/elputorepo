from dataclasses import dataclass
from src.apps.rest.utils.schemas import Schema
from src.contexts.core.domain.repositories.shift_repository import ShiftRepository
from src.contexts.core.domain.value_objects.employee_id import EmployeeId
from src.contexts.core.domain.value_objects.company_id import CompanyId
from src.contexts.core.domain.entities.shift import Shift, ShiftPrimitives
from src.contexts.core.domain.value_objects.shift_id import ShiftId
from src.contexts.shared.domain.event_bus import EventBus
from src.contexts.shared.settings import Settings
from logger.main import get_logger


class CreateShiftCommand(Schema):
    shift_id: str
    employee_id: str
    company_id: str


class CreateShiftResult(Schema):
    shift: ShiftPrimitives


logger = get_logger(__name__)


@dataclass
class CreateShiftCommandHandler:
    shift_repository: ShiftRepository
    settings: Settings
    event_bus: EventBus

    def handle(self, command: CreateShiftCommand) -> CreateShiftResult:
        logger.info(
            "Handling CreateShiftCommand",
            query=command.to_plain_values(),
            found_shifts=[self.settings.app_name],
        )

        shift = Shift.create(
            id=ShiftId(command.shift_id),
            employee_id=EmployeeId(command.employee_id),
            company_id=CompanyId(command.company_id),
        )

        result = self.shift_repository.save(shift)

        if isinstance(result, Exception):
            raise result

        self.event_bus.publish(shift.pull_events())

        return CreateShiftResult(shift=shift.to_primitives())
