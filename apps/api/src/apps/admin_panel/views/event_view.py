from sqladmin import ModelView

from src.contexts.core.infrastructure.schemas.event_postgres_schema import (
    EventPostgresSchema,
)


class EventView(ModelView, model=EventPostgresSchema):
    column_list = ["event_id", "name"]
