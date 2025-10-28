import pytest
from src.contexts.core.domain.entities.event import Event
from src.contexts.core.domain.value_objects import EventId, EventName
from sqlalchemy.orm import Session

from src.contexts.core.infrastructure.repositories.postgres_event_repository import (
    PostgresEventRepository,
)
from sqlalchemy.exc import SQLAlchemyError
from src.contexts.core.infrastructure.schemas.event_postgres_schema import (
    EventPostgresSchema,
)


@pytest.fixture
def repo(postgres_session: Session) -> PostgresEventRepository:
    return PostgresEventRepository(session=postgres_session)


@pytest.fixture
def event(postgres_session: Session) -> Event:
    return Event.create(
        id=EventId.generate(),
        name=EventName("Alice"),
    )


@pytest.mark.integration
def test_save_and_get_all_events(postgres_session: Session):
    # Arrange
    event_id = EventId.generate()
    event_name = EventName("ACME Inc")

    event_schema = EventPostgresSchema(
        event_id=event_id.value,
        name=event_name.value,
    )

    postgres_session.add(event_schema)
    postgres_session.commit()

    repo = PostgresEventRepository(session=postgres_session)
    event = Event.create(
        id=EventId.generate(),
        name=EventName("Alice"),
    )

    # Act
    result = repo.save(event)
    assert result is None, "Expected save() to return None on success"

    event = repo.get(event_id)

    # Assert
    assert isinstance(event, Event)
    assert event.id == event_id
    assert event.name == event_name


@pytest.mark.integration
def test_save_handles_sqlalchemy_error_gracefully(
    monkeypatch: pytest.MonkeyPatch, postgres_session: Session
):
    repo = PostgresEventRepository(session=postgres_session)
    event = Event.create(
        id=EventId.generate(),
        name=EventName("Bob"),
    )

    def fail_add(_):
        raise SQLAlchemyError("Simulated DB error")

    monkeypatch.setattr(postgres_session, "add", fail_add)  # type: ignore

    result = repo.save(event)

    assert isinstance(result, SQLAlchemyError)
    assert "Simulated DB error" in str(result)


@pytest.mark.integration
def test_save_returns_exception_without_raising(
    monkeypatch: pytest.MonkeyPatch, postgres_session: Session
):
    repo = PostgresEventRepository(session=postgres_session)
    event = Event.create(
        id=EventId.generate(),
        name=EventName("Charlie"),
    )

    def fail_add(_):
        raise SQLAlchemyError("Simulated DB error")

    monkeypatch.setattr(postgres_session, "add", fail_add)  # type: ignore

    result = repo.save(event)

    # No debería lanzarse, sino devolverse
    assert isinstance(result, SQLAlchemyError)
    assert "Simulated DB error" in str(result)


@pytest.mark.integration
def test_get_handles_sqlalchemy_error_gracefully(
    monkeypatch: pytest.MonkeyPatch, postgres_session: Session
):
    repo = PostgresEventRepository(session=postgres_session)
    event_id = EventId.generate()

    def fail_query(_):
        raise SQLAlchemyError("Simulated DB error")

    monkeypatch.setattr(postgres_session, "query", fail_query)  # type: ignore

    result = repo.get(EventId(event_id.value))

    assert isinstance(result, SQLAlchemyError)
    assert "Simulated DB error" in str(result)
