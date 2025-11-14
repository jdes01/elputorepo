import logging
import sys
from dataclasses import dataclass

from fastapi import FastAPI
from logger.fastapi import RequestContextMiddleware
from logger.main import configure_logger

from src.contexts.shared.settings import Settings

from .router import Router


@dataclass
class AppFactory:
    routers: list[Router]
    settings: Settings

    def create(self) -> FastAPI:
        # Get log level from settings, default to DEBUG in local, INFO otherwise
        is_local = self.settings.environment.lower() in (
            "local",
            "dev",
            "development",
        )
        log_level = self.settings.log_level or ("DEBUG" if is_local else "INFO")
        configure_logger(level=log_level)

        app = FastAPI(docs_url="/docs")

        uvicorn_loggers = ["uvicorn.access", "uvicorn.error", "fastapi"]
        for name in uvicorn_loggers:
            logging.getLogger(name).handlers = []
            logging.getLogger(name).addHandler(logging.StreamHandler(sys.stdout))
            logging.getLogger(name).setLevel(logging.INFO)

        app.add_middleware(RequestContextMiddleware)

        for router in self.routers:
            app.include_router(router.connect())

        return app
