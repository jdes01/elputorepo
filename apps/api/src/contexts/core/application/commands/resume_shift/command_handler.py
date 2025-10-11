from dataclasses import dataclass
from src.apps.rest.utils.schemas import Schema
from src.contexts.core.domain.repositories.shift_repository import ShiftRepository
from src.contexts.core.domain.entities.shift import ShiftPrimitives
from src.contexts.core.domain.value_objects.shift_id import ShiftId
from src.contexts.shared.domain.event_bus import EventBus
from src.contexts.shared.settings import Settings
from logger.main import get_logger


class ResumeShiftCommand(Schema):
    shift_id: str


class ResumeShiftResult(Schema):
    shift: ShiftPrimitives


logger = get_logger(__name__)


@dataclass
class ResumeShiftCommandHandler:
    shift_repository: ShiftRepository
    settings: Settings
    event_bus: EventBus

    def handle(self, command: ResumeShiftCommand) -> ResumeShiftResult:
        logger.info(
            "Handling ResumeShiftCommand",
            query=command.to_plain_values(),
            found_shifts=[self.settings.app_name],
        )

        shift = self.shift_repository.get(ShiftId(command.shift_id))

        if isinstance(shift, Exception):
            raise shift

        if shift is None:
            raise Exception(f"Shift with id {command.shift_id} not found")

        shift.resume()

        save_result = self.shift_repository.save(shift)

        if isinstance(save_result, Exception):
            raise save_result

        self.event_bus.publish(shift.pull_events())

        return ResumeShiftResult(shift=shift.to_primitives())
