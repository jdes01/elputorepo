from dataclasses import dataclass
from sqlalchemy.orm import Session

from src.contexts.core.domain.entities.shift import Shift
from src.contexts.core.domain.entities.shift_pause import ShiftPause
from src.contexts.core.domain.value_objects.company_id import CompanyId
from src.contexts.core.domain.value_objects.employee_id import EmployeeId
from src.contexts.core.domain.value_objects.shift_id import ShiftId
from src.contexts.core.domain.value_objects.shift_pause_id import ShiftPauseId
from src.contexts.core.domain.value_objects.shift_pause_status import ShiftPauseStatus
from src.contexts.core.domain.value_objects.shift_status import ShiftStatus
from src.contexts.core.infrastructure.schemas.shift_postgres_schema import (
    ShiftPausePostgresSchema,
    ShiftPostgresSchema,
)
from ...domain.repositories.shift_repository import ShiftRepository
from logger.main import get_logger

logger = get_logger(__name__)


@dataclass
class PostgresShiftRepository(ShiftRepository):
    session: Session

    def save(self, shift: Shift) -> None | Exception:
        try:
            existing = (
                self.session.query(ShiftPostgresSchema)
                .filter_by(shift_id=shift.id.value)
                .one_or_none()
            )

            if existing:
                existing.employee_id = shift.employee_id.value  # type: ignore
                existing.company_id = shift.company_id.value  # type: ignore
                existing.status = shift.status.value  # type: ignore
                existing.start_datetime = shift.start_datetime  # type: ignore
                existing.end_datetime = shift.end_datetime  # type: ignore

                existing_pauses = {p.pause_id: p for p in existing.pauses}
                domain_pauses = {p.id.value: p for p in shift.pauses}

                for pause_id, pause in domain_pauses.items():
                    if pause_id in existing_pauses:
                        db_pause = existing_pauses[pause_id]
                        db_pause.status = pause.status.value  # type: ignore
                        db_pause.creation_datetime = pause.creation_datetime
                        db_pause.start_datetime = pause.start_datetime
                        db_pause.end_datetime = pause.end_datetime
                    else:
                        existing.pauses.append(self._to_pause_schema(pause))

                for pause_id in set(existing_pauses.keys()) - set(domain_pauses.keys()):
                    db_pause = existing_pauses[pause_id]
                    self.session.delete(db_pause)

            else:
                schema = self._to_schema(shift)
                self.session.add(schema)

            self.session.commit()
            return None

        except Exception as e:
            self.session.rollback()
            return e

    def get(self, shift_id: ShiftId) -> Shift | None | Exception:
        try:
            schema = (
                self.session.query(ShiftPostgresSchema)
                .filter_by(shift_id=shift_id.value)
                .one_or_none()
            )
            if schema is None:
                return None

            return self._to_entity(schema)
        except Exception as e:
            return e

    def _to_schema(self, shift: Shift) -> ShiftPostgresSchema:
        """Convierte una entidad de dominio Shift a su schema ORM."""
        schema = ShiftPostgresSchema(
            shift_id=shift.id.value,
            employee_id=shift.employee_id.value,
            company_id=shift.company_id.value,
            status=shift.status.value,
            start_datetime=shift.start_datetime,
            end_datetime=shift.end_datetime,
        )
        schema.pauses = [self._to_pause_schema(p) for p in shift.pauses]
        return schema

    def _to_pause_schema(self, pause: ShiftPause) -> ShiftPausePostgresSchema:
        return ShiftPausePostgresSchema(
            pause_id=pause.id.value,
            shift_id=pause.shift_id.value,
            status=pause.status.value,
            creation_datetime=pause.creation_datetime,
            start_datetime=pause.start_datetime,
            end_datetime=pause.end_datetime,
        )

    def _to_entity(self, schema: ShiftPostgresSchema) -> Shift:
        """Convierte un schema ORM a una entidad de dominio."""
        pauses = [
            ShiftPause(
                id=ShiftPauseId(p.pause_id),
                shift_id=ShiftId(p.shift_id),
                status=ShiftPauseStatus(p.status),
                creation_datetime=p.creation_datetime,
                start_datetime=p.start_datetime,
                end_datetime=p.end_datetime,
            )
            for p in schema.pauses
        ]

        return Shift(
            id=ShiftId(schema.shift_id),  # type: ignore
            employee_id=EmployeeId(schema.employee_id),  # type: ignore
            company_id=CompanyId(schema.company_id),  # type: ignore
            status=ShiftStatus(schema.status),
            start_datetime=schema.start_datetime,  # type: ignore
            end_datetime=schema.end_datetime,  # type: ignore
            pauses=pauses,
        )
