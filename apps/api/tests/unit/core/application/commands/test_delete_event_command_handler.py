"""Tests for DeleteEventCommandHandler."""

from datetime import datetime
from unittest.mock import Mock

import pytest
from freezegun import freeze_time
from returns.result import Failure, Success

from src.contexts.core.application.commands.delete_event.command_handler import (
    DeleteEventCommand,
    DeleteEventCommandHandler,
)
from src.contexts.core.domain.entities.event import Event, EventPrimitives
from src.contexts.core.domain.events.event_deleted_domain_event import EventDeletedDomainEvent
from src.contexts.core.domain.value_objects.event_id import EventId
from src.contexts.shared.infrastructure.exceptions import DatabaseError


@pytest.fixture
def mock_repository():
    """Create a mock repository."""
    return Mock()


@pytest.fixture
def event_bus():
    """Create a mock event bus."""
    return Mock()


@pytest.fixture
def handler(mock_repository: Mock, event_bus: Mock):
    """Create handler instance."""
    return DeleteEventCommandHandler(event_repository=mock_repository, event_bus=event_bus)


@pytest.fixture
def existing_event_id() -> EventId:
    return EventId("123e4567-e89b-12d3-a456-426614174000")


@pytest.fixture
def existing_event(existing_event_id: EventId) -> Event:
    return Event.from_primitives(EventPrimitives(id=existing_event_id.value, name="event name", capacity=10))


@freeze_time("2025-11-14 15:00:00")
def test_handle_success(handler: Mock, mock_repository: Mock, existing_event: Mock, event_bus: Mock):
    """Test successful event deletion."""
    # Arrange
    command = DeleteEventCommand(event_id=existing_event.id.value)
    mock_repository.get.return_value = Success(existing_event)
    mock_repository.save.return_value = Success(None)

    # Act
    result = handler.handle(command)

    # Assert
    assert isinstance(result, Success)
    mock_repository.save.assert_called_once_with(existing_event)
    event_bus.publish.assert_called_once_with([EventDeletedDomainEvent(datetime.now(), existing_event.id)])


def test_handle_repository_error(handler: Mock, mock_repository: Mock):
    """Test handler when repository returns error."""
    # Arrange
    command = DeleteEventCommand(event_id="123e4567-e89b-12d3-a456-426614174000")
    error = DatabaseError("Database connection failed")
    mock_repository.save.return_value = Failure(error)

    # Act
    result = handler.handle(command)

    # Assert
    assert isinstance(result, Failure)
    assert result.failure() == error
    mock_repository.save.assert_called_once()
