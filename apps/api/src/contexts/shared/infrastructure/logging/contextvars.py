from contextvars import ContextVar

# Valores por request
correlation_id_var: ContextVar[str] = ContextVar("correlation_id", default="")
execution_id_var: ContextVar[str] = ContextVar("execution_id", default="")
