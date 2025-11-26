from enum import Enum
from typing import Any


class LogEntrySeverity(str, Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"


LogEntryExtra = dict[str, Any]


class LogEntry:
    _severity: LogEntrySeverity
    _message: str
    _extra: LogEntryExtra
    _correlation_id: str | None

    def __init__(self, severity: LogEntrySeverity, message: str, extra: LogEntryExtra = {}, correlation_id: str | None = None) -> None:
        self._severity = severity
        self._message = message
        self._extra = extra

        if correlation_id is None:
            try:
                from asgi_correlation_id import correlation_id as context_correlation_id

                correlation_id = context_correlation_id.get()
            except (ImportError, LookupError):
                correlation_id = None

        self._correlation_id = correlation_id

    @property
    def severity(self) -> LogEntrySeverity:
        return self._severity

    @property
    def message(self) -> str:
        return self._message

    @property
    def extra(self) -> LogEntryExtra:
        return self._extra

    @property
    def correlation_id(self) -> str | None:
        return self._correlation_id
