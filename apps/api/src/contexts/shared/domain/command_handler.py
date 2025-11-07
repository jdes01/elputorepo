from abc import ABC, abstractmethod
from typing import Generic, TypeVar

from returns.result import Result

from src.contexts.shared.domain.schemas import Schema
from src.contexts.shared.infrastructure.logging import log_handler_start

Command = TypeVar("Command", bound=Schema)
ResultType = TypeVar("ResultType", bound=Schema)


class CommandHandler(ABC, Generic[Command, ResultType]):
    @abstractmethod
    def _handle(self, command: Command) -> Result[ResultType, Exception]:
        pass

    def handle(self, command: Command) -> Result[ResultType, Exception]:
        command_dict = command.model_dump() if hasattr(command, "model_dump") else {}
        log_handler_start(self.__class__.__name__, **command_dict)
        return self._handle(command)

