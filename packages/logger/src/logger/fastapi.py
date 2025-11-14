# logger/fastapi.py
from typing import Any, Callable
import json

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import StreamingResponse
import uuid
from .context import request_id_var, execution_id_var
from .main import get_logger


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable[..., Any]):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        execution_id = request.headers.get("X-Execution-ID", str(uuid.uuid4()))

        request.state.request_id = request_id
        request.state.execution_id = execution_id

        # Set ContextVars para que el logger los recoja automáticamente
        request_id_var.set(request_id)
        execution_id_var.set(execution_id)

        logger = get_logger("request")
        request.state.logger = logger

        # Get request body
        request_body = await self._get_request_body(request)

        # Log request start with path and body
        logger.debug(
            "request.start",
            extra={
                "method": request.method,
                "path": request.url.path,
                "query_params": dict(request.query_params),
                "body": request_body,
            },
        )

        response = await call_next(request)

        # Get response body
        response_body = await self._get_response_body(response)

        # Log request end with response
        logger.debug(
            "request.end",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "body": response_body,
            },
        )

        return response

    async def _get_request_body(self, request: Request) -> dict[Any, Any] | str | None:
        """Get request body without consuming it."""
        try:
            if request.method in ("GET", "HEAD", "OPTIONS"):
                return None

            # Read body without consuming it
            body_bytes = await request.body()
            if not body_bytes:
                return None

            # Restore body for FastAPI to read
            async def receive() -> dict[str, Any]:
                return {"type": "http.request", "body": body_bytes}

            request._receive = receive

            # Try to parse as JSON
            try:
                return json.loads(body_bytes.decode())
            except (json.JSONDecodeError, UnicodeDecodeError):
                return body_bytes.decode()[:500]  # Limit size
        except Exception:
            return None

    async def _get_response_body(self, response) -> dict[str, Any] | str | None:
        """Get response body."""
        if isinstance(response, StreamingResponse):
            return None

        try:
            # Read response body
            body = b""
            async for chunk in response.body_iterator:
                body += chunk

            # Restore body for response
            async def body_iterator():
                yield body

            response.body_iterator = body_iterator()

            # Try to parse as JSON
            try:
                return json.loads(body.decode())
            except (json.JSONDecodeError, UnicodeDecodeError):
                return body.decode()[:500]  # Limit size
        except Exception:
            return None
