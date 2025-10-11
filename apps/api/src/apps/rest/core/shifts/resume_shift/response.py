from src.apps.rest.utils.schemas import Schema
from src.contexts.core.domain.entities.shift import ShiftPrimitives


class ResumeShiftResponse(Schema):
    shift: ShiftPrimitives
