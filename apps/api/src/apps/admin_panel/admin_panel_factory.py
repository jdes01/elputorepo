from dataclasses import dataclass

from fastapi import FastAPI
from sqladmin import Admin
from sqlalchemy import Engine

from .views import EventView


@dataclass
class AdminPanelFactory:
    engine: Engine

    def create(self, app: FastAPI) -> Admin:
        admin_app = Admin(app=app, engine=self.engine)
        admin_app.add_view(EventView)
        return admin_app
