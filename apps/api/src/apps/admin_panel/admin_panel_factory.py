from dataclasses import dataclass
from sqladmin import Admin

from fastapi import FastAPI
from sqlalchemy import Engine
from .views import PizzaView


@dataclass
class AdminPanelFactory:
    engine: Engine

    def create(self, app: FastAPI) -> Admin:
        admin_app = Admin(app=app, engine=self.engine)
        admin_app.add_view(PizzaView)
        return admin_app
