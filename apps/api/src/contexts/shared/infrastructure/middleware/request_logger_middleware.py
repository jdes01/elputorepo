# middlewares/request_logger.py
from collections.abc import MutableMapping
from time import time
from typing import Any

from starlette.requests import Request
from starlette.types import ASGIApp, Receive, Scope, Send

from src.contexts.shared.infrastructure.logging.contextvars import correlation_id_var, execution_id_var
from src.contexts.shared.infrastructure.logging.logger import Logger


class RequestLoggerMiddleware:
    def __init__(self, app: ASGIApp, logger: Logger) -> None:
        self.app = app
        self.logger = logger

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request = Request(scope, receive=receive)

        # Leer IDs desde contextvars
        correlation_id = correlation_id_var.get()
        execution_id = execution_id_var.get()

        client_host = request.client.host if request.client else "unknown"
        client_port = request.client.port if request.client else 0

        # Log de request
        self.logger.info(
            f"{client_host}:{client_port} - {request.method} {request.url.path}",
            extra={
                "correlation_id": correlation_id,
                "execution_id": execution_id,
                "headers": dict(request.headers),
            },
        )

        start = time()

        async def send_wrapper(message: MutableMapping[str, Any]) -> None:
            if message["type"] == "http.response.start":
                status_code = message["status"]
                self.logger.info(
                    f"Response {request.method} {request.url.path} -> {status_code} ({int((time() - start) * 1000)}ms)",
                    extra={
                        "correlation_id": correlation_id,
                        "execution_id": execution_id,
                    },
                )
            await send(message)

        await self.app(scope, receive, send_wrapper)
