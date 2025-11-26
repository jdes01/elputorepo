import uuid

from starlette.types import ASGIApp, Receive, Scope, Send

from ..logging.contextvars import correlation_id_var, execution_id_var


class ContextVarsMiddleware:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        # IDs: del header si existe, sino generar
        from starlette.requests import Request

        request = Request(scope, receive=receive)
        correlation_id = request.headers.get("x-correlation-id") or str(uuid.uuid4())
        execution_id = str(uuid.uuid4())

        # Guardar en contextvars
        correlation_id_var.set(correlation_id)
        execution_id_var.set(execution_id)

        # También opcionalmente en scope
        scope["correlation_id"] = correlation_id
        scope["execution_id"] = execution_id

        await self.app(scope, receive, send)
