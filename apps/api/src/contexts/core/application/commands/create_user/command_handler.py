from dataclasses import dataclass

from logger.main import get_logger
from returns.result import Failure, Result, Success

from src.contexts.shared import CommandHandler, DomainError, Schema, Settings
from src.contexts.shared.domain.event_bus import EventBus

from ....domain import User, UserEmail, UserId, UserPrimitives, UserRepository

logger = get_logger(__name__)


class CreateUserCommand(Schema):
    user_id: str
    email: str


class CreateUserResult(Schema):
    user: UserPrimitives


@dataclass
class CreateUserCommandHandler(CommandHandler[CreateUserCommand, CreateUserResult]):
    user_repository: UserRepository
    settings: Settings
    event_bus: EventBus

    def _handle(self, command: CreateUserCommand) -> Result[CreateUserResult, Exception]:
        try:
            user_id = UserId(command.user_id)
            user_email = UserEmail(command.email)
        except DomainError as e:
            logger.warning("Validation error", extra={"error": str(e), "user_id": command.user_id, "email": command.email})
            return Failure(e)

        user = User.create(id=user_id, email=user_email)

        result = self.user_repository.save(user)

        match result:
            case Failure(error):
                logger.error("Error creating user", extra={"error": str(error)}, exc_info=True)
                return Failure(error)
            case Success(_):
                self.event_bus.publish(user.pull_domain_events())
                logger.info("User created successfully", extra={"user_id": command.user_id, "email": command.email})
                return Success(CreateUserResult(user=user.to_primitives()))
