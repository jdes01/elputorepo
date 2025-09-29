from dataclasses import dataclass
import logging
import sys
from fastapi import FastAPI
from logger.main import configure_logger

from src.apps.rest.core.router import CoreRouter

from logger.fastapi import RequestContextMiddleware


@dataclass
class AppFactory:
    core_router: CoreRouter

    def create(self):
        configure_logger(level="INFO")

        app = FastAPI(docs_url="/docs")

        uvicorn_loggers = ["uvicorn.access", "uvicorn.error", "fastapi"]
        for name in uvicorn_loggers:
            logging.getLogger(name).handlers = []
            logging.getLogger(name).addHandler(logging.StreamHandler(sys.stdout))
            logging.getLogger(name).setLevel(logging.INFO)

        app.add_middleware(RequestContextMiddleware)

        app.include_router(self.core_router.connect())

        return app
