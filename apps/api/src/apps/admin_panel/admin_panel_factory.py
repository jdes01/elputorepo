from dataclasses import dataclass
from sqladmin import Admin

from fastapi import FastAPI
from sqlalchemy import Engine
from .views import EmployeeView, ShiftView, ShiftPauseView


@dataclass
class AdminPanelFactory:
    engine: Engine

    def create(self, app: FastAPI) -> Admin:
        admin_app = Admin(app=app, engine=self.engine)
        admin_app.add_view(EmployeeView)
        admin_app.add_view(ShiftView)
        admin_app.add_view(ShiftPauseView)
        return admin_app
