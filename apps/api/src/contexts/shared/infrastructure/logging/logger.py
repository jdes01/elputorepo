from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any

import structlog

from .contextvars import correlation_id_var, execution_id_var
from .log_entry import LogEntry, LogEntryExtra, LogEntrySeverity


class Logger(ABC):
    def __init__(self) -> None:
        self._configure_structlog()

    def _configure_structlog(self) -> None:
        structlog.configure(
            processors=[
                structlog.contextvars.merge_contextvars,
                structlog.processors.add_log_level,
                structlog.processors.TimeStamper(fmt="iso"),
                structlog.processors.JSONRenderer(),
            ]
        )

    def _build_structured_payload(self, entry: LogEntry) -> dict[str, Any]:
        payload = {
            "timestamp": datetime.utcnow().isoformat(),
            "severity": entry.severity.value,
            "message": entry.message,
        }

        if "correlation_id" not in payload:
            cid = correlation_id_var.get()
            if cid:
                payload["correlation_id"] = cid

        if "execution_id" not in payload:
            eid = execution_id_var.get()
            if eid:
                payload["execution_id"] = eid

        # Extra
        payload.update(entry.extra or {})

        return payload

    @abstractmethod
    def log(self, entry: LogEntry) -> None:
        raise NotImplementedError

    def debug(self, message: str, extra: LogEntryExtra | None = None) -> None:
        self.log(LogEntry(severity=LogEntrySeverity.DEBUG, message=message, extra=extra))

    def info(self, message: str, extra: LogEntryExtra | None = None) -> None:
        self.log(LogEntry(severity=LogEntrySeverity.INFO, message=message, extra=extra))

    def warning(self, message: str, extra: LogEntryExtra | None = None) -> None:
        self.log(LogEntry(severity=LogEntrySeverity.WARNING, message=message, extra=extra))

    def error(self, message: str, extra: LogEntryExtra | None = None) -> None:
        self.log(LogEntry(severity=LogEntrySeverity.ERROR, message=message, extra=extra))
