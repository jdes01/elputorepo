from abc import ABC, abstractmethod

from returns.result import Result

from .command import Command
from .command_handler_result import CommandHandlerResult


class CommandHandler[C: Command, R: CommandHandlerResult](ABC):
    @abstractmethod
    async def handle(self, command: C) -> Result[R, Exception]:
        pass
