import logging
import sys
from collections.abc import Callable
from dataclasses import dataclass, field

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.contexts.shared.infrastructure.logging.log_entry import LogEntry, LogEntrySeverity
from src.contexts.shared.infrastructure.logging.logger import Logger
from src.contexts.shared.infrastructure.middleware.context_vars_middleware import ContextVarsMiddleware
from src.contexts.shared.infrastructure.middleware.request_logger_middleware import RequestLoggerMiddleware
from src.contexts.shared.settings import Settings

from .router import Router


@dataclass
class AppFactory:
    routers: list[Router]
    settings: Settings
    logger: Logger
    startup_callbacks: list[Callable] = field(default_factory=list)

    def with_routers(self, routers: list[Router]) -> "AppFactory":
        self.routers = routers
        return self

    def on_startup(self, on_startup: list[Callable]) -> "AppFactory":
        self.startup_callbacks.extend(on_startup)
        return self

    def create(self) -> FastAPI:
        app = FastAPI(docs_url="/docs")

        class InterceptHandler(logging.Handler):
            def __init__(self, logger: Logger, level: int = logging.NOTSET) -> None:
                super().__init__(level)
                self.logger = logger

            def emit(self, record: logging.LogRecord) -> None:
                try:
                    # Normalizamos niveles
                    level = record.levelname.upper()
                    if level not in ("DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"):
                        level = "INFO"

                    self.logger.log(
                        LogEntry(
                            severity=LogEntrySeverity[level],
                            message=record.getMessage(),
                        )
                    )
                except Exception:
                    print(record.getMessage(), file=sys.stderr)

        for name in ("uvicorn.access", "uvicorn.error", "fastapi"):
            uvicorn_logger = logging.getLogger(name)
            uvicorn_logger.handlers = []
            uvicorn_logger.propagate = False
            uvicorn_logger.addHandler(InterceptHandler(logger=self.logger))

        # --- Middleware de logs ---
        app.add_middleware(RequestLoggerMiddleware, logger=self.logger)
        app.add_middleware(ContextVarsMiddleware)

        for router in self.routers:
            app.include_router(router.connect())

        for callback in self.startup_callbacks:
            app.add_event_handler("startup", callback)

        origins = ["*"]

        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,  # orígenes permitidos
            allow_credentials=True,
            allow_methods=["*"],  # GET, POST, PUT, DELETE, etc
            allow_headers=["*"],  # Headers que permites
        )

        return app
