from sqladmin import ModelView

from src.contexts.core.infrastructure import PizzaPostgresSchema


class PizzaView(ModelView, model=PizzaPostgresSchema):
    column_list = [PizzaPostgresSchema.id, PizzaPostgresSchema.name]
