from dataclasses import dataclass

from returns.result import Failure, Result, Success

from src.contexts.shared import Command, CommandHandler, CommandHandlerResult, DomainError, Settings
from src.contexts.shared.domain.event_bus import EventBus
from src.contexts.shared.infrastructure.logging.logger import Logger

from ....domain import User, UserEmail, UserId, UserPrimitives, UserRepository


class CreateUserCommand(Command):
    user_id: str
    email: str
    age: int


class CreateUserResult(CommandHandlerResult):
    user: UserPrimitives


@dataclass
class CreateUserCommandHandler(CommandHandler[CreateUserCommand, CreateUserResult]):
    user_repository: UserRepository
    settings: Settings
    event_bus: EventBus
    logger: Logger

    async def handle(self, command: CreateUserCommand) -> Result[CreateUserResult, Exception]:
        self.logger.debug("Processing CreateUserCommandHandler command", extra={"command": command.to_plain_values()})
        try:
            user_id = UserId(command.user_id)
            user_email = UserEmail(command.email)
        except DomainError as e:
            self.logger.warning("Validation error", extra={"error": str(e), "user_id": command.user_id, "email": command.email})
            return Failure(e)

        user = User.create(id=user_id, email=user_email)

        result = self.user_repository.save(user)

        if isinstance(result, Failure):
            self.logger.error("Error creating user", extra={"error": str(result.failure())})
            return Failure(result.failure())

        await self.event_bus.publish(user.pull_domain_events())
        self.logger.info("User created successfully", extra={"user_id": command.user_id, "email": command.email})
        return Success(CreateUserResult(user=user.to_primitives()))
