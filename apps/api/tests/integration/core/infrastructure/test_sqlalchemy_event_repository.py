from unittest.mock import Mock

import pytest
from returns.result import Failure, Success
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from src.contexts.core.domain.entities.event import Event
from src.contexts.core.domain.value_objects import EventId, EventName
from src.contexts.core.domain.value_objects.event_capacity import EventCapacity
from src.contexts.core.infrastructure.postgres.schemas.event_postgres_schema import (
    EventPostgresSchema,
)
from src.contexts.core.infrastructure.repositories.postgres_event_repository import (
    PostgresEventRepository,
)
from src.contexts.shared.infrastructure.exceptions import DatabaseError
from src.contexts.shared.infrastructure.logging.logger import Logger


@pytest.fixture
def logger() -> Mock:
    return Mock(spec=Logger)


@pytest.fixture
def repo(postgres_session: Session, logger: Logger) -> PostgresEventRepository:
    return PostgresEventRepository(session=postgres_session, logger=logger)


@pytest.fixture
def event(postgres_session: Session) -> Event:
    return Event.create(id=EventId.generate(), name=EventName("Alice"), capacity=EventCapacity(10))


@pytest.mark.integration
def test_save_and_get_all_events(postgres_session: Session, logger: Logger) -> None:
    # Arrange
    event_id = EventId.generate()
    event_name = EventName("ACME Inc")
    event_capacity = EventCapacity(10)

    event_schema = EventPostgresSchema(event_id=event_id.value, name=event_name.value, capacity=event_capacity.value)

    postgres_session.add(event_schema)
    postgres_session.commit()

    repo = PostgresEventRepository(session=postgres_session, logger=logger)
    event = Event.create(id=EventId.generate(), name=EventName("Alice"), capacity=EventCapacity(10))

    # Act
    result = repo.persist(event)
    assert isinstance(result, Success), "Expected persist() to return Success on success"
    assert result.unwrap() is None

    event_result = repo.get(event_id)
    assert isinstance(event_result, Success), "Expected get() to return Success"
    event = event_result.unwrap()

    # Assert
    assert isinstance(event, Event)
    assert event.id == event_id
    assert event.name == event_name


@pytest.mark.integration
def test_save_handles_sqlalchemy_error_gracefully(monkeypatch: pytest.MonkeyPatch, postgres_session: Session, logger: Logger) -> None:
    repo = PostgresEventRepository(session=postgres_session, logger=logger)
    event = Event.create(id=EventId.generate(), name=EventName("Bob"), capacity=EventCapacity(10))

    def fail_add(_) -> None:
        raise SQLAlchemyError("Simulated DB error")

    monkeypatch.setattr(postgres_session, "add", fail_add)  # type: ignore

    result = repo.persist(event)

    assert isinstance(result, Failure)
    error = result.failure()
    assert isinstance(error, DatabaseError)
    assert isinstance(error.original_error, SQLAlchemyError)
    assert "Simulated DB error" in str(error)


@pytest.mark.integration
def test_save_returns_exception_without_raising(monkeypatch: pytest.MonkeyPatch, postgres_session: Session, logger: Logger) -> None:
    repo = PostgresEventRepository(session=postgres_session, logger=logger)
    event = Event.create(id=EventId.generate(), name=EventName("Charlie"), capacity=EventCapacity(10))

    def fail_add(_) -> None:
        raise SQLAlchemyError("Simulated DB error")

    monkeypatch.setattr(postgres_session, "add", fail_add)  # type: ignore

    result = repo.persist(event)

    # No debería lanzarse, sino devolverse
    assert isinstance(result, Failure)
    error = result.failure()
    assert isinstance(error, DatabaseError)
    assert isinstance(error.original_error, SQLAlchemyError)
    assert "Simulated DB error" in str(error)


@pytest.mark.integration
def test_get_handles_sqlalchemy_error_gracefully(monkeypatch: pytest.MonkeyPatch, postgres_session: Session, logger: Logger) -> None:
    repo = PostgresEventRepository(session=postgres_session, logger=logger)
    event_id = EventId.generate()

    def fail_query(_) -> None:
        raise SQLAlchemyError("Simulated DB error")

    monkeypatch.setattr(postgres_session, "query", fail_query)  # type: ignore

    result = repo.get(EventId(event_id.value))

    assert isinstance(result, Failure)
    error = result.failure()
    assert isinstance(error, DatabaseError)
    assert isinstance(error.original_error, SQLAlchemyError)
    assert "Simulated DB error" in str(error)
