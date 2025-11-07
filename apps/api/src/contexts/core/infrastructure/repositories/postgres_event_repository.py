from dataclasses import dataclass
from datetime import datetime
from typing import List

from logger.main import get_logger
from returns.result import Failure, Result, Success
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from src.contexts.core.domain.entities.event import Event, EventPrimitives
from src.contexts.core.domain.repositories.event_repository import EventRepository
from src.contexts.core.domain.value_objects.event_id import EventId
from src.contexts.core.infrastructure.schemas.event_postgres_schema import (
    EventPostgresSchema,
)
from src.contexts.shared.infrastructure.exceptions import DatabaseError

logger = get_logger(__name__)


@dataclass
class PostgresEventRepository(EventRepository):
    session: Session

    def save(self, event: Event) -> Result[None, Exception]:
        try:
            logger.debug(
                "Saving event to database",
                extra={"event_id": event.id.value, "name": event.name.value},
            )

            with self.session.begin():
                existing = self.session.query(EventPostgresSchema).filter_by(event_id=event.id.value).one_or_none()

                if existing:
                    existing.name = event.name.value  # type: ignore
                    existing.capacity = event.capacity.value  # type: ignore
                    existing.deleted_at = event._deleted_at  # type: ignore
                else:
                    new_event = EventPostgresSchema(
                        event_id=event.id.value,
                        name=event.name.value,
                        capacity=event.capacity.value,
                        deleted_at=event._deleted_at,
                    )
                    self.session.add(new_event)

            logger.debug(
                "Event saved successfully",
                extra={"event_id": event.id.value},
            )

            return Success(None)

        except SQLAlchemyError as e:
            logger.warning(
                "Error saving event to database",
                extra={"event_id": event.id.value, "error": str(e)},
            )
            self.session.rollback()
            return Failure(
                DatabaseError(
                    f"Error saving event: {str(e)}",
                    original_error=e,
                )
            )

    def get(self, event_id: EventId) -> Result[Event | None, Exception]:
        try:
            logger.debug(
                "Getting event from database",
                extra={"event_id": event_id.value},
            )

            event = self.session.query(EventPostgresSchema).filter_by(event_id=event_id.value).filter(EventPostgresSchema.deleted_at.is_(None)).one_or_none()

            if event is None:
                logger.debug(
                    "Event not found in database",
                    extra={"event_id": event_id.value},
                )
                return Success(None)

            logger.debug(
                "Event retrieved successfully",
                extra={"event_id": event_id.value},
            )

            return Success(
                Event.from_primitives(
                    EventPrimitives(
                        id=event.event_id,  # type: ignore
                        name=event.name,  # type: ignore
                        capacity=event.capacity,  # type: ignore
                        deleted_at=event.deleted_at,  # type: ignore
                    )
                )
            )

        except SQLAlchemyError as e:
            logger.warning(
                "Error getting event from database",
                extra={"event_id": event_id.value, "error": str(e)},
            )
            return Failure(
                DatabaseError(
                    f"Error getting event: {str(e)}",
                    original_error=e,
                )
            )

    def get_all(self) -> Result[List[Event], Exception]:
        try:
            logger.debug("Getting all events from database")

            events = self.session.query(EventPostgresSchema).filter(EventPostgresSchema.deleted_at.is_(None)).all()

            logger.debug(
                "All events retrieved successfully",
                extra={"count": len(events)},
            )

            return Success(
                [
                    Event.from_primitives(
                        EventPrimitives(
                            id=event.event_id,  # type: ignore
                            name=event.name,  # type: ignore
                            capacity=event.capacity,  # type: ignore
                            deleted_at=event.deleted_at,  # type: ignore
                        )
                    )
                    for event in events
                ]
            )

        except SQLAlchemyError as e:
            logger.warning(
                "Error getting events from database",
                extra={"error": str(e)},
            )
            return Failure(
                DatabaseError(
                    f"Error getting events: {str(e)}",
                    original_error=e,
                )
            )

    def delete(self, event_id: EventId) -> Result[None, Exception]:
        try:
            logger.debug(
                "Deleting event from database (soft delete)",
                extra={"event_id": event_id.value},
            )

            with self.session.begin():
                event = self.session.query(EventPostgresSchema).filter_by(event_id=event_id.value).filter(EventPostgresSchema.deleted_at.is_(None)).one_or_none()

                if event is None:
                    logger.debug(
                        "Event not found for deletion",
                        extra={"event_id": event_id.value},
                    )
                    return Success(None)

                event.deleted_at = datetime.now()  # type: ignore

            logger.debug(
                "Event deleted successfully (soft delete)",
                extra={"event_id": event_id.value},
            )

            return Success(None)

        except SQLAlchemyError as e:
            logger.warning(
                "Error deleting event from database",
                extra={"event_id": event_id.value, "error": str(e)},
            )
            self.session.rollback()
            return Failure(
                DatabaseError(
                    f"Error deleting event: {str(e)}",
                    original_error=e,
                )
            )
