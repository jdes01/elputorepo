"""Tests for CreateEventCommandHandler."""

from unittest.mock import AsyncMock

import pytest
from returns.result import Failure, Success

from src.contexts.core.application.commands.create_event.command_handler import (
    CreateEventCommand,
    CreateEventCommandHandler,
)
from src.contexts.core.domain.repositories.event_repository import EventRepository
from src.contexts.shared.infrastructure.exceptions import DatabaseError
from src.contexts.shared.infrastructure.logging.logger import Logger
from src.contexts.shared.settings import Settings


@pytest.fixture
def logger() -> AsyncMock:
    return AsyncMock(spec=Logger)


@pytest.fixture
def mock_repository() -> AsyncMock:
    return AsyncMock(spec=EventRepository)


@pytest.fixture
def event_bus() -> AsyncMock:
    return AsyncMock()


@pytest.fixture
def mock_settings() -> AsyncMock:
    return AsyncMock(spec=Settings)


@pytest.fixture
def handler(mock_repository: AsyncMock, mock_settings: AsyncMock, event_bus: AsyncMock, logger: Logger) -> CreateEventCommandHandler:
    return CreateEventCommandHandler(event_repository=mock_repository, settings=mock_settings, event_bus=event_bus, logger=logger)


@pytest.mark.asyncio
async def test_handle_success(handler: CreateEventCommandHandler, mock_repository: EventRepository) -> None:
    # Arrange
    command = CreateEventCommand(event_id="123e4567-e89b-12d3-a456-426614174000", name="Test Event", capacity=10)
    mock_repository.persist.return_value = Success(None)

    # Act
    result = await handler.handle(command)

    # Assert
    assert isinstance(result, Success)
    assert result.unwrap().event.id == "123e4567-e89b-12d3-a456-426614174000"
    assert result.unwrap().event.name == "Test Event"
    mock_repository.persist.assert_called_once()


@pytest.mark.asyncio
async def test_handle_repository_error(handler: CreateEventCommandHandler, mock_repository: EventRepository) -> None:
    """Test handler when repository returns error."""
    # Arrange
    command = CreateEventCommand(event_id="123e4567-e89b-12d3-a456-426614174000", name="Test Event", capacity=10)
    error = DatabaseError("Database connection failed")
    mock_repository.persist.return_value = Failure(error)

    # Act
    result = await handler.handle(command)

    # Assert
    assert isinstance(result, Failure)
    assert result.failure() == error
    mock_repository.persist.assert_called_once()
