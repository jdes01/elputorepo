import logging
import sys
from collections.abc import Callable
from dataclasses import dataclass, field

from fastapi import FastAPI
from logger.fastapi import RequestContextMiddleware
from logger.main import configure_logger

from src.contexts.shared.settings import Settings

from .router import Router


@dataclass
class AppFactory:
    routers: list[Router]
    settings: Settings
    startup_callbacks: list[Callable] = field(default_factory=list)

    def with_routers(self, routers: list[Router]) -> "AppFactory":
        self.routers = routers
        return self

    def on_startup(self, on_startup: list[Callable]) -> "AppFactory":
        for callback in on_startup:
            self.startup_callbacks.append(callback)
        return self

    def create(self) -> FastAPI:
        configure_logger(level=self.settings.log_level)

        app = FastAPI(docs_url="/docs")

        uvicorn_loggers = ["uvicorn.access", "uvicorn.error", "fastapi"]
        for name in uvicorn_loggers:
            logging.getLogger(name).handlers = []
            logging.getLogger(name).addHandler(logging.StreamHandler(sys.stdout))
            logging.getLogger(name).setLevel(logging.INFO)

        app.add_middleware(RequestContextMiddleware)

        for router in self.routers:
            app.include_router(router.connect())

        for callback in self.startup_callbacks:
            app.add_event_handler("startup", callback)

        return app
