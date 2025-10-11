from dataclasses import dataclass

from src.apps.rest.utils.schemas import Schema
from src.contexts.core.domain.entities.shift import Shift, ShiftPrimitives
from src.contexts.core.domain.errors.shift_not_found_error import ShiftNotFoundError
from src.contexts.core.domain.repositories.shift_repository import ShiftRepository
from src.contexts.core.domain.value_objects.shift_id import ShiftId
from src.contexts.shared.settings import Settings
from logger.main import get_logger


class GetShiftQuery(Schema):
    shift_id: str


class GetShiftResult(Schema):
    shift: ShiftPrimitives


logger = get_logger(__name__)


@dataclass
class GetShiftQueryHandler:
    shift_repository: ShiftRepository
    settings: Settings

    def handle(self, query: GetShiftQuery) -> GetShiftResult:
        logger.info(
            "Handling GetShiftQuery",
            query=query.to_plain_values(),
            found_employees=[self.settings.app_name],
        )

        shift = self.shift_repository.get(shift_id=ShiftId(query.shift_id))

        match shift:
            case Shift():
                return GetShiftResult(shift=shift.to_primitives())
            case None:
                raise ShiftNotFoundError(query.shift_id)
            case Exception() as e:
                logger.error("Error fetching employees", error=str(e))
                raise e
