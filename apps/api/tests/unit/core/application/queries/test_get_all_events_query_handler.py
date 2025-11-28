"""Tests for GetAllEventsQueryHandler."""

from unittest.mock import AsyncMock

import pytest
from returns.result import Failure, Success

from src.contexts.core.application.queries.get_all_events.query_handler import (
    GetAllEventsQuery,
    GetAllEventsQueryHandler,
)
from src.contexts.core.application.services.event_projection_service import AllEventsProjectionService, EventProjection
from src.contexts.core.domain.value_objects.event_id import EventId
from src.contexts.shared.infrastructure.exceptions import DatabaseError
from src.contexts.shared.infrastructure.logging.logger import Logger


@pytest.fixture
def mock_event_projection_service() -> AsyncMock:
    """Create a mock repository."""
    return AsyncMock()


@pytest.fixture
def logger() -> AsyncMock:
    return AsyncMock(spec=Logger)


@pytest.fixture
def handler(mock_event_projection_service: AllEventsProjectionService, logger: Logger) -> GetAllEventsQueryHandler:
    """Create handler instance."""
    return GetAllEventsQueryHandler(event_projection_service=mock_event_projection_service, logger=logger)


@pytest.mark.asyncio
async def test_handle_success(handler: GetAllEventsQueryHandler, mock_event_projection_service: AllEventsProjectionService) -> None:
    """Test successful events retrieval."""
    # Arrange
    query = GetAllEventsQuery()
    events = [
        EventProjection(id=EventId.generate().value, name="Event Name aaa", capacity=10),
        EventProjection(id=EventId.generate().value, name="Event Name bbb", capacity=10),
    ]
    mock_event_projection_service.get_all.return_value = Success(events)

    # Act
    result = await handler.handle(query)

    # Assert
    assert isinstance(result, Success)
    assert len(result.unwrap().events) == 2
    mock_event_projection_service.get_all.assert_called_once()


@pytest.mark.asyncio
async def test_handle_empty_list(handler: GetAllEventsQueryHandler, mock_event_projection_service: AllEventsProjectionService) -> None:
    """Test handler when no events exist."""
    # Arrange
    query = GetAllEventsQuery()
    mock_event_projection_service.get_all.return_value = Success([])

    # Act
    result = await handler.handle(query)

    # Assert
    assert isinstance(result, Success)
    assert len(result.unwrap().events) == 0
    mock_event_projection_service.get_all.assert_called_once()


@pytest.mark.asyncio
async def test_handle_repository_error(handler: GetAllEventsQueryHandler, mock_event_projection_service: AllEventsProjectionService) -> None:
    """Test handler when repository returns error."""
    # Arrange
    query = GetAllEventsQuery()
    error = DatabaseError("Database connection failed")
    mock_event_projection_service.get_all.return_value = Failure(error)

    # Act
    result = await handler.handle(query)

    # Assert
    assert isinstance(result, Failure)
    assert result.failure() == error
    mock_event_projection_service.get_all.assert_called_once()
