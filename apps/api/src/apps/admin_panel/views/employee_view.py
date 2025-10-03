from sqladmin import ModelView

from src.contexts.core.infrastructure import EmployeePostgresSchema


class EmployeeView(ModelView, model=EmployeePostgresSchema):
    column_list = [EmployeePostgresSchema.id, EmployeePostgresSchema.name]
