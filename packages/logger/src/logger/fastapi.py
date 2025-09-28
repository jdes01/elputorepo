from typing import Any, Callable
import uuid
from fastapi import Request
from .main import get_logger
from starlette.middleware.base import BaseHTTPMiddleware


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable[..., Any]) -> Any:
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        execution_id = request.headers.get("X-Execution-ID", str(uuid.uuid4()))

        request.state.request_id = request_id
        request.state.execution_id = execution_id

        logger = get_logger("request").bind(
            request_id=request_id,
            execution_id=execution_id,
            method=request.method,
            path=str(request.url),
        )
        request.state.logger = logger

        logger.info("request.start")
        response = await call_next(request)
        logger.info("request.end", status_code=response.status_code)
        return response
