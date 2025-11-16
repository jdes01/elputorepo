from dataclasses import dataclass
from datetime import datetime

from logger.main import get_logger
from returns.result import Failure, Result, Success
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from src.contexts.core.domain.entities.event import Event, EventPrimitives
from src.contexts.core.domain.repositories.event_repository import EventRepository
from src.contexts.core.domain.value_objects.event_id import EventId
from src.contexts.core.infrastructure.postgres.schemas.event_postgres_schema import (
    EventPostgresSchema,
)
from src.contexts.shared.domain.exceptions.domain_error import DomainError
from src.contexts.shared.infrastructure.exceptions import DatabaseError

logger = get_logger(__name__)


@dataclass
class PostgresEventRepository(EventRepository):
    session: Session

    def create(self, event: Event) -> Result[None, Exception]:
        try:
            with self.session.begin():
                existing = self.session.query(EventPostgresSchema).filter_by(event_id=event.id.value).one_or_none()
                if existing:
                    return Failure(DomainError(f"Event with ID {event.id.value} already exists"))

                new_event = EventPostgresSchema(
                    event_id=event.id.value,
                    name=event.name.value,
                    capacity=event.capacity.value,
                )
                self.session.add(new_event)
                self.session.commit()

            return Success(None)

        except SQLAlchemyError as e:
            return Failure(DatabaseError(f"Error creating event: {str(e)}", original_error=e))
        except Exception as e:
            return Failure(e)

    def persist(self, event: Event) -> Result[None, Exception]:
        try:
            with self.session.begin():
                existing = self.session.query(EventPostgresSchema).filter_by(event_id=event.id.value).one_or_none()

                if getattr(event, "is_deleted", False):
                    if existing and existing.deleted_at is None:
                        existing.deleted_at = datetime.now()
                        logger.debug("Soft deleted event", extra={"event_id": event.id.value})
                else:
                    if existing:
                        existing.name = event.name.value
                        existing.capacity = event.capacity.value
                        logger.debug("Updated existing event", extra={"event_id": event.id.value})
                    else:
                        new_event = EventPostgresSchema(
                            event_id=event.id.value,
                            name=event.name.value,
                            capacity=event.capacity.value,
                        )
                        self.session.add(new_event)
                        logger.debug("Created new event", extra={"event_id": event.id.value})

                self.session.commit()

            return Success(None)

        except SQLAlchemyError as e:
            logger.warning("Error persisting event", extra={"event_id": event.id.value, "error": str(e)})
            return Failure(DatabaseError(f"Error persisting event: {str(e)}", original_error=e))
        except Exception as e:
            logger.warning("Unexpected error persisting event", extra={"event_id": event.id.value, "error": str(e)}, exc_info=True)
            return Failure(e)

    def get(self, event_id: EventId) -> Result[Event | None, Exception]:
        try:
            with self.session.begin():
                logger.debug("Getting event from database", extra={"event_id": event_id.value})

                event = self.session.query(EventPostgresSchema).filter_by(event_id=event_id.value).filter(EventPostgresSchema.deleted_at.is_(None)).one_or_none()

                if event is None:
                    logger.debug("Event not found in database", extra={"event_id": event_id.value})
                    return Success(None)

                logger.debug("Event retrieved successfully", extra={"event_id": event_id.value})
                return Success(Event.from_primitives(EventPrimitives(id=event.event_id, name=event.name, capacity=event.capacity)))

        except SQLAlchemyError as e:
            logger.warning("Error getting event from database", extra={"event_id": event_id.value, "error": str(e)})
            return Failure(DatabaseError(f"Error getting event: {str(e)}", original_error=e))

        except Exception as e:
            logger.warning("Unexpected error getting event", extra={"event_id": event_id.value, "error": str(e)}, exc_info=True)
            return Failure(e)
