"""Tests for DeleteEventCommandHandler."""

from unittest.mock import Mock

import pytest
from returns.result import Failure, Success

from src.contexts.core.application.commands.delete_event.command_handler import (
    DeleteEventCommand,
    DeleteEventCommandHandler,
)
from src.contexts.core.domain.value_objects.event_id import EventId
from src.contexts.shared.infrastructure.exceptions import DatabaseError


@pytest.fixture
def mock_repository():
    """Create a mock repository."""
    return Mock()


@pytest.fixture
def handler(mock_repository):
    """Create handler instance."""
    return DeleteEventCommandHandler(event_repository=mock_repository)


def test_handle_success(handler, mock_repository):
    """Test successful event deletion."""
    # Arrange
    command = DeleteEventCommand(event_id="123e4567-e89b-12d3-a456-426614174000")
    mock_repository.delete.return_value = Success(None)

    # Act
    result = handler.handle(command)

    # Assert
    assert isinstance(result, Success)
    assert result.unwrap().success is True
    mock_repository.delete.assert_called_once_with(EventId(command.event_id))


def test_handle_repository_error(handler, mock_repository):
    """Test handler when repository returns error."""
    # Arrange
    command = DeleteEventCommand(event_id="123e4567-e89b-12d3-a456-426614174000")
    error = DatabaseError("Database connection failed")
    mock_repository.delete.return_value = Failure(error)

    # Act
    result = handler.handle(command)

    # Assert
    assert isinstance(result, Failure)
    assert result.failure() == error
    mock_repository.delete.assert_called_once()
