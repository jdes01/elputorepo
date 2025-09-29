from contextvars import ContextVar

request_id_var: ContextVar[str] = ContextVar("request_id", default="")
execution_id_var: ContextVar[str] = ContextVar("execution_id", default="")

def set_execution_id(execution_id: str):
    execution_id_var.set(execution_id)

def get_execution_id() -> str | None:
    return execution_id_var.get()

def set_request_id(request_id: str):
    request_id_var.set(request_id)

def get_request_id() -> str | None:
    return request_id_var.get()
