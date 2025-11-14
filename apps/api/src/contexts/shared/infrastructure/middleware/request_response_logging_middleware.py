import json
import time
from collections.abc import Awaitable, Callable
from typing import Any

from fastapi import Request, Response
from logger.main import get_logger
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import StreamingResponse

logger = get_logger(__name__)


class RequestResponseLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware that logs all requests and responses in DEBUG mode."""

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        start_time = time.time()

        # Log request
        body = await self._get_body(request)
        query_params = dict(request.query_params)

        logger.debug(
            "Request received",
            extra={
                "method": request.method,
                "path": request.url.path,
                "query_params": query_params,
                "body": body,
            },
        )

        # Process request
        response = await call_next(request)

        # Calculate duration
        duration = time.time() - start_time

        # Log response
        response_body = await self._get_response_body(response)

        logger.debug(
            "Response sent",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": round(duration * 1000, 2),
                "body": response_body,
            },
        )

        return response

    async def _get_body(self, request: Request) -> Any:
        """Get request body without consuming it."""
        try:
            if request.method in ("GET", "HEAD", "OPTIONS"):
                return None

            # Read body without consuming it
            body_bytes = await request.body()
            if not body_bytes:
                return None

            # Restore body for FastAPI to read
            async def receive() -> dict[str, str | bytes]:
                return {"type": "http.request", "body": body_bytes}

            request._receive = receive  # type: ignore

            # Try to parse as JSON
            try:
                return json.loads(body_bytes.decode())
            except (json.JSONDecodeError, UnicodeDecodeError):
                return body_bytes.decode()[:500]  # Limit size
        except Exception:
            return None

    async def _get_response_body(self, response: Response) -> Any:
        """Get response body."""
        if isinstance(response, StreamingResponse):
            # Can't log streaming responses
            return None

        try:
            # Read body
            body: bytes = b""

            if hasattr(response, "body"):
                body = response.body
            elif hasattr(response, "render") and callable(response.render):
                # Some Response subclasses (like JSONResponse) use render()
                body = response.render(b"")  # Provide empty bytes to render
            else:
                return None

            # Convert memoryview to bytes
            if isinstance(body, memoryview):
                body = body.tobytes()

            # Try to parse JSON
            try:
                return json.loads(body.decode())
            except (json.JSONDecodeError, UnicodeDecodeError):
                return body.decode(errors="replace")[:500]  # Limit size

        except Exception:
            return None
