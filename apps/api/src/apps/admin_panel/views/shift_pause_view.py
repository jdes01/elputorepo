import uuid
from sqladmin import ModelView
from src.contexts.core.infrastructure.schemas.shift_postgres_schema import (
    ShiftPausePostgresSchema,
)


class ShiftPauseView(ModelView, model=ShiftPausePostgresSchema):
    column_list = [
        "pause_id",
        "status",
        "creation_datetime",
        "start_datetime",
        "end_datetime",
    ]
    form_columns = [
        "pause_id",
        "status",
        "creation_datetime",
        "start_datetime",
        "end_datetime",
    ]

    async def on_model_change(self, model, is_created: bool):
        # Generar pause_id automáticamente si no existe
        if is_created and not model.pause_id:
            model.pause_id = str(uuid.uuid4())
