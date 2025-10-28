from dataclasses import dataclass
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from logger.main import get_logger
from src.contexts.core.domain.repositories.event_repository import EventRepository
from src.contexts.core.domain.entities.event import Event, EventPrimitives
from src.contexts.core.domain.value_objects.event_id import EventId
from src.contexts.core.infrastructure.schemas.event_postgres_schema import (
    EventPostgresSchema,
)

logger = get_logger(__name__)


@dataclass
class PostgresEventRepository(EventRepository):
    session: Session

    def save(self, event: Event) -> None | Exception:
        try:
            with self.session.begin():
                existing = (
                    self.session.query(EventPostgresSchema)
                    .filter_by(event_id=event.id.value)
                    .one_or_none()
                )

                if existing:
                    existing.name = event.name.value  # type: ignore
                else:
                    new_event = EventPostgresSchema(
                        event_id=event.id.value,
                        name=event.name.value,
                    )
                    self.session.add(new_event)

                logger.info(
                    f"Event saved/updated: {event.id.value} ({event.name.value})"
                )

                return None

        except SQLAlchemyError as e:
            logger.exception("Error saving event")
            self.session.rollback()
            return e

    def get(self, event_id: EventId) -> Event | None | Exception:
        try:
            event = (
                self.session.query(EventPostgresSchema)
                .filter_by(event_id=event_id.value)
                .one_or_none()
            )

            if event is None:
                return None

            return Event.from_primitives(
                EventPrimitives(
                    id=event.event_id,  # type: ignore
                    name=event.name,  # type: ignore
                )
            )

        except SQLAlchemyError as e:
            logger.exception("Error fetching event")
            return e
