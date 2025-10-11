from sqladmin import ModelView
from src.contexts.core.infrastructure.schemas.shift_postgres_schema import (
    ShiftPostgresSchema,
    ShiftPausePostgresSchema,
)


class ShiftView(ModelView, model=ShiftPostgresSchema):
    column_list = [
        "shift_id",
        "employee_id",
        "company_id",
        "status",
        "start_datetime",
        "end_datetime",
        "pauses",
    ]
    form_columns = [
        "shift_id",
        "employee_id",
        "company_id",
        "status",
        "start_datetime",
    ]

    # Permitir crear pausas directamente desde el formulario de Shift
    inline_models = [ShiftPausePostgresSchema]
