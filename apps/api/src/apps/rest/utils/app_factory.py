from dataclasses import dataclass

from fastapi import FastAPI

from src.apps.rest.core.router import CoreRouter


@dataclass
class AppFactory:
    core_router: CoreRouter

    def create(self):
        app = FastAPI(docs_url="/docs")
        app.include_router(self.core_router.connect())
        return app
