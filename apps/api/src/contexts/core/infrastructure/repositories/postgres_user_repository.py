from dataclasses import dataclass

from logger.main import get_logger
from returns.result import Failure, Result, Success
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from src.contexts.core.domain.entities.user import User, UserPrimitives
from src.contexts.core.domain.repositories.user_repository import UserRepository
from src.contexts.core.domain.value_objects.user_id import UserId
from src.contexts.core.infrastructure.postgres.schemas.user_postgres_schema import (
    UserPostgresSchema,
)
from src.contexts.shared.infrastructure.exceptions import DatabaseError

logger = get_logger(__name__)


@dataclass
class PostgresUserRepository(UserRepository):
    session: Session

    def save(self, user: User) -> Result[None, Exception]:
        try:
            logger.debug(
                "Saving user to database",
                extra={"user_id": user.id.value, "email": user.email.value},
            )

            with self.session.begin():
                existing = self.session.query(UserPostgresSchema).filter_by(user_id=user.id.value).one_or_none()

                if existing:
                    logger.debug("User with same id already exists", extra={"event_id": user.id.value})
                    return Failure(DatabaseError(f"User with id {user.id.value} already exists"))

                new_user = UserPostgresSchema(user_id=user.id.value, email=user.email.value)
                self.session.add(new_user)

            logger.debug("User saved successfully", extra={"user_id": user.id.value})
            return Success(None)

        except SQLAlchemyError as e:
            logger.warning("Database error saving user", extra={"error": str(e)}, exc_info=True)
            return Failure(DatabaseError(f"Database error: {str(e)}"))

        except Exception as e:
            logger.warning("Unexpected error saving user", extra={"error": str(e)}, exc_info=True)
            return Failure(e)

    def find_by_id(self, user_id: UserId) -> Result[User | None, Exception]:
        try:
            logger.debug("Finding user by ID", extra={"user_id": user_id.value})

            user_schema = self.session.query(UserPostgresSchema).filter_by(user_id=user_id.value).one_or_none()

            if not user_schema:
                logger.debug("User not found", extra={"user_id": user_id.value})
                return Success(None)

            user = User.from_primitives(UserPrimitives(id=user_schema.user_id, email=user_schema.email))

            logger.debug("User found", extra={"user_id": user_id.value})
            return Success(user)

        except SQLAlchemyError as e:
            logger.warning("Database error finding user", extra={"error": str(e)}, exc_info=True)
            return Failure(DatabaseError(f"Database error: {str(e)}"))

        except Exception as e:
            logger.warning("Unexpected error finding user", extra={"error": str(e)}, exc_info=True)
            return Failure(e)
