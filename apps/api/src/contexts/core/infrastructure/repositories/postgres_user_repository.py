from dataclasses import dataclass

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
from src.contexts.shared.infrastructure.logging.logger import Logger


@dataclass
class PostgresUserRepository(UserRepository):
    session: Session
    logger: Logger

    def save(self, user: User) -> Result[None, Exception]:
        try:
            self.logger.debug(
                "Saving user to database",
                extra={"user_id": user.id.value, "email": user.email.value},
            )

            with self.session.begin():
                existing = self.session.query(UserPostgresSchema).filter_by(user_id=user.id.value).one_or_none()

                if existing:
                    self.logger.debug("User with same id already exists", extra={"event_id": user.id.value})
                    return Failure(DatabaseError(f"User with id {user.id.value} already exists"))

                new_user = UserPostgresSchema(user_id=user.id.value, email=user.email.value)
                self.session.add(new_user)

            self.logger.debug("User saved successfully", extra={"user_id": user.id.value})
            return Success(None)

        except SQLAlchemyError as e:
            self.logger.warning("Database error saving user", extra={"error": str(e)})
            return Failure(DatabaseError(f"Database error: {str(e)}"))

        except Exception as e:
            self.logger.warning("Unexpected error saving user", extra={"error": str(e)})
            return Failure(e)

    def find_by_id(self, user_id: UserId) -> Result[User | None, Exception]:
        try:
            self.logger.debug("Finding user by ID", extra={"user_id": user_id.value})

            user_schema = self.session.query(UserPostgresSchema).filter_by(user_id=user_id.value).one_or_none()

            if not user_schema:
                self.logger.debug("User not found", extra={"user_id": user_id.value})
                return Success(None)

            user = User.from_primitives(UserPrimitives(id=user_schema.user_id, email=user_schema.email))

            self.logger.debug("User found", extra={"user_id": user_id.value})
            return Success(user)

        except SQLAlchemyError as e:
            self.logger.warning("Database error finding user", extra={"error": str(e)})
            return Failure(DatabaseError(f"Database error: {str(e)}"))

        except Exception as e:
            self.logger.warning("Unexpected error finding user", extra={"error": str(e)})
            return Failure(e)
