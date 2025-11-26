# logger/structured_logger.py
import structlog

from .log_entry import LogEntry
from .logger import Logger


class StructuredLogger(Logger):
    def __init__(self) -> None:
        super().__init__()
        self._logger = structlog.get_logger()

    def log(self, entry: LogEntry) -> None:
        payload = self._build_structured_payload(entry)
        self._logger.log(entry.severity.value.lower(), **payload)
