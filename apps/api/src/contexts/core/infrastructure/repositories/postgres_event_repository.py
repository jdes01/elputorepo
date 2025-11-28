from dataclasses import dataclass
from datetime import datetime

from returns.result import Failure, Result, Success
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from src.contexts.core.domain.entities.event import Event, EventPrimitives
from src.contexts.core.domain.repositories.event_repository import EventRepository
from src.contexts.core.domain.value_objects.event_id import EventId
from src.contexts.core.infrastructure.postgres.schemas.event_postgres_schema import (
    EventPostgresSchema,
)
from src.contexts.shared.infrastructure.exceptions import DatabaseError
from src.contexts.shared.infrastructure.logging.logger import Logger


@dataclass
class PostgresEventRepository(EventRepository):
    session: Session
    logger: Logger

    def persist(self, event: Event) -> Result[None, Exception]:
        try:
            with self.session.begin():
                existing = self.session.query(EventPostgresSchema).filter_by(event_id=event.id.value).one_or_none()

                if getattr(event, "is_deleted", False):
                    if existing and existing.deleted_at is None:
                        existing.deleted_at = datetime.now()
                        self.logger.debug("Soft deleted event", extra={"event_id": event.id.value})
                else:
                    if existing:
                        existing.name = event.name.value
                        existing.capacity = event.capacity.value
                        self.logger.debug("Updated existing event", extra={"event_id": event.id.value})
                    else:
                        new_event = EventPostgresSchema(
                            event_id=event.id.value,
                            name=event.name.value,
                            capacity=event.capacity.value,
                        )
                        self.session.add(new_event)
                        self.logger.debug("Created new event", extra={"event_id": event.id.value})

                self.session.commit()

            return Success(None)

        except SQLAlchemyError as e:
            self.logger.warning("Error persisting event", extra={"event_id": event.id.value, "error": str(e)})
            return Failure(DatabaseError(f"Error persisting event: {str(e)}", original_error=e))
        except Exception as e:
            self.logger.warning("Unexpected error persisting event", extra={"event_id": event.id.value, "error": str(e)})
            return Failure(e)

    def get(self, event_id: EventId) -> Result[Event | None, Exception]:
        try:
            with self.session.begin():
                self.logger.debug("Getting event from database", extra={"event_id": event_id.value})

                event = self.session.query(EventPostgresSchema).filter_by(event_id=event_id.value).filter(EventPostgresSchema.deleted_at.is_(None)).one_or_none()

                if event is None:
                    self.logger.debug("Event not found in database", extra={"event_id": event_id.value})
                    return Success(None)

                self.logger.debug("Event retrieved successfully", extra={"event_id": event_id.value})
                return Success(Event.from_primitives(EventPrimitives(id=event.event_id, name=event.name, capacity=event.capacity, deleted_at=None)))

        except SQLAlchemyError as e:
            self.logger.warning("Error getting event from database", extra={"event_id": event_id.value, "error": str(e)})
            return Failure(DatabaseError(f"Error getting event: {str(e)}", original_error=e))

        except Exception as e:
            self.logger.warning("Unexpected error getting event", extra={"event_id": event_id.value, "error": str(e)})
            return Failure(e)
