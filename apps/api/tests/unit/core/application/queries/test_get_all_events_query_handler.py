"""Tests for GetAllEventsQueryHandler."""

from unittest.mock import Mock

import pytest
from returns.result import Failure, Success

from src.contexts.core.application.queries.get_all_events.query_handler import (
    GetAllEventsQuery,
    GetAllEventsQueryHandler,
)
from src.contexts.core.domain.entities.event import Event
from src.contexts.core.domain.value_objects.event_capacity import EventCapacity
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
    return GetAllEventsQueryHandler(event_repository=mock_repository)


def test_handle_success(handler, mock_repository):
    """Test successful events retrieval."""
    # Arrange
    query = GetAllEventsQuery()
    events = [
        Event.create(id=EventId.generate(), name=EventName("Event Name aaa"), capacity=EventCapacity(10)),
        Event.create(id=EventId.generate(), name=EventName("Event Name bbb"), capacity=EventCapacity(10)),
    ]
    mock_repository.get_all.return_value = Success(events)

    # Act
    result = handler.handle(query)

    # Assert
    assert isinstance(result, Success)
    assert len(result.unwrap().events) == 2
    mock_repository.get_all.assert_called_once()


def test_handle_empty_list(handler, mock_repository):
    """Test handler when no events exist."""
    # Arrange
    query = GetAllEventsQuery()
    mock_repository.get_all.return_value = Success([])

    # Act
    result = handler.handle(query)

    # Assert
    assert isinstance(result, Success)
    assert len(result.unwrap().events) == 0
    mock_repository.get_all.assert_called_once()


def test_handle_repository_error(handler, mock_repository):
    """Test handler when repository returns error."""
    # Arrange
    query = GetAllEventsQuery()
    error = DatabaseError("Database connection failed")
    mock_repository.get_all.return_value = Failure(error)

    # Act
    result = handler.handle(query)

    # Assert
    assert isinstance(result, Failure)
    assert result.failure() == error
    mock_repository.get_all.assert_called_once()
