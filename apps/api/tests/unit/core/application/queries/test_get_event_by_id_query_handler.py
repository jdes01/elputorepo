"""Tests for GetEventByIdQueryHandler."""

from unittest.mock import Mock

import pytest
from returns.result import Failure, Success

from src.contexts.core.application.queries.get_event_by_id.query_handler import (
    GetEventByIdQuery,
    GetEventByIdQueryHandler,
)
from src.contexts.core.domain.entities.event import Event
from src.contexts.core.domain.errors.event_not_found_error import EventNotFoundError
from src.contexts.core.domain.value_objects.event_id import EventId
from src.contexts.core.domain.value_objects.event_name import EventName
from src.contexts.shared.infrastructure.exceptions import DatabaseError


@pytest.fixture
def mock_repository():
    """Create a mock repository."""
    return Mock()


@pytest.fixture
def handler(mock_repository):
    """Create handler instance."""
    return GetEventByIdQueryHandler(event_repository=mock_repository)


def test_handle_success(handler, mock_repository):
    """Test successful event retrieval."""
    # Arrange
    query = GetEventByIdQuery(event_id="123e4567-e89b-12d3-a456-426614174000")
    event = Event.create(
        id=EventId("123e4567-e89b-12d3-a456-426614174000"),
        name=EventName("Test Event"),
    )
    mock_repository.get.return_value = Success(event)

    # Act
    result = handler.handle(query)

    # Assert
    assert isinstance(result, Success)
    assert result.unwrap().event.id == "123e4567-e89b-12d3-a456-426614174000"
    assert result.unwrap().event.name == "Test Event"
    mock_repository.get.assert_called_once_with(EventId(query.event_id))


def test_handle_event_not_found(handler, mock_repository):
    """Test handler when event is not found."""
    # Arrange
    query = GetEventByIdQuery(event_id="123e4567-e89b-12d3-a456-426614174000")
    mock_repository.get.return_value = Success(None)

    # Act
    result = handler.handle(query)

    # Assert
    assert isinstance(result, Success)
    assert result.unwrap().event is None
    mock_repository.get.assert_called_once()


def test_handle_repository_error(handler, mock_repository):
    """Test handler when repository returns error."""
    # Arrange
    query = GetEventByIdQuery(event_id="123e4567-e89b-12d3-a456-426614174000")
    error = DatabaseError("Database connection failed")
    mock_repository.get.return_value = Failure(error)

    # Act
    result = handler.handle(query)

    # Assert
    assert isinstance(result, Failure)
    assert result.failure() == error
    mock_repository.get.assert_called_once()
