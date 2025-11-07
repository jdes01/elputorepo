"""Tests for CreateEventCommandHandler."""

from unittest.mock import Mock

import pytest
from returns.result import Failure, Success

from src.contexts.core.application.commands.create_event.command_handler import (
    CreateEventCommand,
    CreateEventCommandHandler,
)
from src.contexts.shared.infrastructure.exceptions import DatabaseError
from src.contexts.shared.settings import Settings


@pytest.fixture
def mock_repository():
    """Create a mock repository."""
    return Mock()


@pytest.fixture
def mock_settings():
    """Create mock settings."""
    return Mock(spec=Settings)


@pytest.fixture
def handler(mock_repository, mock_settings):
    """Create handler instance."""
    return CreateEventCommandHandler(
        event_repository=mock_repository,
        settings=mock_settings,
    )


def test_handle_success(handler, mock_repository):
    """Test successful event creation."""
    # Arrange
    command = CreateEventCommand(event_id="123e4567-e89b-12d3-a456-426614174000", name="Test Event")
    mock_repository.save.return_value = Success(None)

    # Act
    result = handler.handle(command)

    # Assert
    assert isinstance(result, Success)
    assert result.unwrap().event.id == "123e4567-e89b-12d3-a456-426614174000"
    assert result.unwrap().event.name == "Test Event"
    mock_repository.save.assert_called_once()


def test_handle_repository_error(handler, mock_repository):
    """Test handler when repository returns error."""
    # Arrange
    command = CreateEventCommand(event_id="123e4567-e89b-12d3-a456-426614174000", name="Test Event")
    error = DatabaseError("Database connection failed")
    mock_repository.save.return_value = Failure(error)

    # Act
    result = handler.handle(command)

    # Assert
    assert isinstance(result, Failure)
    assert result.failure() == error
    mock_repository.save.assert_called_once()
