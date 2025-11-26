import os

from ...settings import Settings
from .logger import Logger
from .rich_logger import RichLogger
from .structured_logger import StructuredLogger


class LoggerProvider:
    @classmethod
    def provide(cls, settings: Settings) -> Logger:
        if os.getenv("DEBUG") == "1":
            return RichLogger()

        return StructuredLogger()
