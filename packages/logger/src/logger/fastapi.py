# logger/fastapi.py
from typing import Any, Callable
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
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

        logger.info("request.start", method=request.method, path=str(request.url))
        response = await call_next(request)
        logger.info("request.end", status_code=response.status_code)
        return response
