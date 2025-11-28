"""Tests for DeleteEventCommandHandler."""

from datetime import datetime
from unittest.mock import AsyncMock, Mock

import pytest
from freezegun import freeze_time
from returns.result import Failure, Success

from src.contexts.core.application.commands.delete_event.command_handler import (
    DeleteEventCommand,
    DeleteEventCommandHandler,
)
from src.contexts.core.domain.entities.event import Event, EventPrimitives
from src.contexts.core.domain.events.event_deleted_domain_event import EventDeletedDomainEvent
from src.contexts.core.domain.repositories.event_repository import EventRepository
from src.contexts.core.domain.value_objects.event_id import EventId
from src.contexts.shared.infrastructure.exceptions import DatabaseError
from src.contexts.shared.infrastructure.logging.logger import Logger


@pytest.fixture
def logger() -> AsyncMock:
    return AsyncMock(spec=Logger)


@pytest.fixture
def mock_repository() -> Mock:
    """Create a mock repository."""
    return Mock()


@pytest.fixture
def event_bus() -> AsyncMock:
    """Create a mock event bus."""
    return AsyncMock()


@pytest.fixture
def handler(mock_repository: AsyncMock, event_bus: AsyncMock, logger: Logger) -> DeleteEventCommandHandler:
    """Create handler instance."""
    return DeleteEventCommandHandler(event_repository=mock_repository, event_bus=event_bus, logger=logger)


@pytest.fixture
def existing_event_id() -> EventId:
    return EventId("123e4567-e89b-12d3-a456-426614174000")


@pytest.fixture
def existing_event(existing_event_id: EventId) -> Event:
    return Event.from_primitives(EventPrimitives(id=existing_event_id.value, name="event name", capacity=10, deleted_at=None))


@freeze_time("2025-11-14 15:00:00")
@pytest.mark.asyncio
async def test_handle_success(handler: DeleteEventCommandHandler, mock_repository: EventRepository, existing_event: Event, event_bus: AsyncMock) -> None:
    """Test successful event deletion."""
    # Arrange
    command = DeleteEventCommand(event_id=existing_event.id.value)
    mock_repository.get.return_value = Success(existing_event)
    mock_repository.persist.return_value = Success(None)

    # Act
    result = await handler.handle(command)

    # Assert
    assert isinstance(result, Success)
    mock_repository.persist.assert_called_once_with(existing_event)
    event_bus.publish.assert_called_once_with([EventDeletedDomainEvent(event_id=existing_event.id, timestamp=datetime.strptime("2025-11-14 15:00:00", "%Y-%m-%d %H:%M:%S"))])


@pytest.mark.asyncio
async def test_handle_repository_error(handler: AsyncMock, mock_repository: AsyncMock) -> None:
    """Test handler when repository returns error."""
    # Arrange
    command = DeleteEventCommand(event_id="123e4567-e89b-12d3-a456-426614174000")
    error = DatabaseError("Database connection failed")
    mock_repository.persist.return_value = Failure(error)

    # Act
    result = await handler.handle(command)

    # Assert
    assert isinstance(result, Failure)
    assert result.failure() == error
    mock_repository.persist.assert_called_once()
