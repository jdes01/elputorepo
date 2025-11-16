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
from src.contexts.shared.infrastructure.exceptions import DatabaseError

logger = get_logger(__name__)


@dataclass
class PostgresEventRepository(EventRepository):
    session: Session  # sesión compartida

    def persist(self, event: Event) -> Result[None, Exception]:
        """Crea, actualiza o hace soft delete según el estado del evento."""
        try:
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

            return Success(None)

        except SQLAlchemyError as e:
            logger.warning("Error persisting event", extra={"event_id": event.id.value, "error": str(e)})
            self.session.rollback()
            return Failure(DatabaseError(f"Error persisting event: {str(e)}", original_error=e))

        except Exception as e:
            logger.warning("Unexpected error persisting event", extra={"event_id": event.id.value, "error": str(e)}, exc_info=True)
            return Failure(e)

    def get(self, event_id: EventId) -> Result[Event | None, Exception]:
        try:
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

    def get_all(self) -> Result[list[Event], Exception]:
        try:
            logger.debug("Getting all events from database")
            postgres_events = self.session.query(EventPostgresSchema).filter(EventPostgresSchema.deleted_at.is_(None)).all()

            events = [Event.from_primitives(EventPrimitives(id=e.event_id, name=e.name, capacity=e.capacity)) for e in postgres_events]

            logger.debug("All events retrieved successfully", extra={"count": len(events)})
            return Success(events)

        except SQLAlchemyError as e:
            logger.warning("Error getting events from database", extra={"error": str(e)})
            return Failure(DatabaseError(f"Error getting events: {str(e)}", original_error=e))

        except Exception as e:
            logger.warning("Unexpected error getting all events", extra={"error": str(e)}, exc_info=True)
            return Failure(e)
