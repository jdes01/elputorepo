from abc import ABC, abstractmethod

from returns.result import Result

from ..application.utils.logging import log_handler_start
from .schemas import Schema


class CommandHandler[Command: Schema, ResultType](ABC):
    @abstractmethod
    def _handle(self, command: Command) -> Result[ResultType, Exception]:
        pass

    def handle(self, command: Command) -> Result[ResultType, Exception]:
        command_dict = command.model_dump() if hasattr(command, "model_dump") else {}
        log_handler_start(self.__class__.__name__, **command_dict)
        return self._handle(command)
