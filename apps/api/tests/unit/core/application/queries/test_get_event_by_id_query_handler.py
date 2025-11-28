"""Tests for GetEventByIdQueryHandler."""

from unittest.mock import Mock

import pytest
from returns.result import Failure, Success

from src.contexts.core.application.queries.get_event_by_id.query_handler import (
    GetEventByIdQuery,
    GetEventByIdQueryHandler,
)
from src.contexts.core.application.services.event_projection_service import AllEventsProjectionService, EventProjection
from src.contexts.core.domain.value_objects.event_id import EventId
from src.contexts.shared.infrastructure.exceptions import DatabaseError
from src.contexts.shared.infrastructure.logging.logger import Logger


@pytest.fixture
def logger() -> Mock:
    return Mock(spec=Logger)


@pytest.fixture
def event_projection_service() -> Mock:
    """Create a mock repository."""
    return Mock(spec=AllEventsProjectionService)


@pytest.fixture
def handler(event_projection_service: AllEventsProjectionService, logger: Logger) -> GetEventByIdQueryHandler:
    """Create handler instance."""
    return GetEventByIdQueryHandler(event_projection_service=event_projection_service, logger=logger)


@pytest.mark.asyncio
async def test_handle_success(handler: GetEventByIdQueryHandler, event_projection_service: AllEventsProjectionService) -> None:
    """Test successful event retrieval."""
    # Arrange
    query = GetEventByIdQuery(event_id="123e4567-e89b-12d3-a456-426614174000")
    event_projection = EventProjection(id="123e4567-e89b-12d3-a456-426614174000", name="Test Event", capacity=10)
    event_projection_service.get.return_value = Success(event_projection)

    # Act
    result = await handler.handle(query)

    # Assert
    assert isinstance(result, Success)
    assert result.unwrap().event.id == "123e4567-e89b-12d3-a456-426614174000"
    assert result.unwrap().event.name == "Test Event"
    event_projection_service.get.assert_called_once_with(EventId(query.event_id))


@pytest.mark.asyncio
async def test_handle_event_not_found(handler: GetEventByIdQueryHandler, event_projection_service: AllEventsProjectionService) -> None:
    """Test handler when event is not found."""
    # Arrange
    query = GetEventByIdQuery(event_id="123e4567-e89b-12d3-a456-426614174000")
    event_projection_service.get.return_value = Success(None)

    # Act
    result = await handler.handle(query)

    # Assert
    assert isinstance(result, Success)
    assert result.unwrap().event is None
    event_projection_service.get.assert_called_once()


@pytest.mark.asyncio
async def test_handle_repository_error(handler: GetEventByIdQueryHandler, event_projection_service: AllEventsProjectionService) -> None:
    """Test handler when repository returns error."""
    # Arrange
    query = GetEventByIdQuery(event_id="123e4567-e89b-12d3-a456-426614174000")
    error = DatabaseError("Database connection failed")
    event_projection_service.get.return_value = Failure(error)

    # Act
    result = await handler.handle(query)

    # Assert
    assert isinstance(result, Failure)
    assert result.failure() == error
    event_projection_service.get.assert_called_once()
