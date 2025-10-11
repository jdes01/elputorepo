from unittest import mock
import uuid

import pytest

from src.contexts.core.application.commands.create_shift.command_handler import (
    CreateShiftCommand,
    CreateShiftCommandHandler,
)
from src.contexts.core.domain.events.shift_created_domain_event import ShiftCreated
from src.contexts.core.domain.repositories.shift_repository import ShiftRepository
from src.contexts.core.domain.value_objects.shift_status import ShiftStatus
from src.contexts.shared.domain.event_bus import EventBus
from src.contexts.shared.settings import Settings
from src.contexts.core.domain.value_objects.employee_id import EmployeeId
from src.contexts.core.domain.value_objects.company_id import CompanyId
from src.contexts.core.domain.entities.shift import Shift


def test_create_shift_creates_and_publishes_event():
    mock_repo = mock.create_autospec(ShiftRepository, instance=True)
    mock_event_bus = mock.create_autospec(EventBus, instance=True)

    settings = Settings(app_name="test-app")
    handler = CreateShiftCommandHandler(
        shift_repository=mock_repo,
        event_bus=mock_event_bus,
        settings=settings,
    )

    employee_id = uuid.uuid4().hex
    company_id = uuid.uuid4().hex
    shift_id = uuid.uuid4().hex

    command = CreateShiftCommand(
        shift_id=shift_id, employee_id=employee_id, company_id=company_id
    )

    # Act
    result = handler.handle(command)

    # Assert
    mock_repo.save.assert_called_once()
    saved_shift = mock_repo.save.call_args[0][0]
    assert isinstance(saved_shift, Shift)
    assert saved_shift.employee_id == EmployeeId(employee_id)
    assert saved_shift.company_id == CompanyId(company_id)
    assert saved_shift.status.value == ShiftStatus.PENDING.value

    mock_event_bus.publish.assert_called_once()
    published_events = mock_event_bus.publish.call_args[0][0]
    assert len(published_events) == 1
    event = published_events[0]
    assert event.__class__.__name__ == "ShiftCreated"
    assert event.shift_id == saved_shift.id
    assert event.employee_id == saved_shift.employee_id
    assert event.company_id == saved_shift.company_id

    assert result.shift.id == saved_shift.id.value
    assert result.shift.employee_id == employee_id
    assert result.shift.company_id == company_id
    assert result.shift.status == "PENDING"


def test_create_shift_raises_on_invalid_employee_id():
    mock_repo = mock.create_autospec(ShiftRepository, instance=True)
    mock_event_bus = mock.create_autospec(EventBus, instance=True)
    handler = CreateShiftCommandHandler(
        mock_repo, Settings(app_name="test-app"), mock_event_bus
    )

    shift_id = uuid.uuid4().hex
    employee_id = "not-a-uuid"
    company_id = uuid.uuid4().hex

    with pytest.raises(ValueError):
        handler.handle(
            command=CreateShiftCommand(
                shift_id=shift_id, employee_id=employee_id, company_id=company_id
            )
        )


def test_create_shift_raises_on_invalid_company_id():
    mock_repo = mock.create_autospec(ShiftRepository, instance=True)
    mock_event_bus = mock.create_autospec(EventBus, instance=True)
    handler = CreateShiftCommandHandler(
        mock_repo, Settings(app_name="test-app"), mock_event_bus
    )

    shift_id = uuid.uuid4().hex
    company_id = "not-a-uuid"
    employee_id = uuid.uuid4().hex

    with pytest.raises(ValueError):
        handler.handle(
            command=CreateShiftCommand(
                shift_id=shift_id, employee_id=employee_id, company_id=company_id
            )
        )


def test_create_shift_raises_on_invalid_shift_id():
    mock_repo = mock.create_autospec(ShiftRepository, instance=True)
    mock_event_bus = mock.create_autospec(EventBus, instance=True)
    handler = CreateShiftCommandHandler(
        mock_repo, Settings(app_name="test-app"), mock_event_bus
    )

    company_id = uuid.uuid4().hex
    shift_id = "not-a-uuid"
    employee_id = uuid.uuid4().hex

    with pytest.raises(ValueError):
        handler.handle(
            command=CreateShiftCommand(
                shift_id=shift_id, employee_id=employee_id, company_id=company_id
            )
        )


def test_create_shift_returns_expected_primitives():
    mock_repo = mock.create_autospec(ShiftRepository, instance=True)
    mock_event_bus = mock.create_autospec(EventBus, instance=True)
    handler = CreateShiftCommandHandler(
        mock_repo, Settings(app_name="test-app"), mock_event_bus
    )

    shift_id = uuid.uuid4().hex
    employee_id = uuid.uuid4().hex
    company_id = uuid.uuid4().hex

    command = CreateShiftCommand(
        shift_id=shift_id, employee_id=employee_id, company_id=company_id
    )
    result = handler.handle(command)

    data = result.shift
    assert data.id == shift_id
    assert data.employee_id == employee_id
    assert data.company_id == company_id
    assert data.status == ShiftStatus.PENDING.value


def test_create_shift_publishes_shift_created_event():
    mock_repo = mock.create_autospec(ShiftRepository, instance=True)
    mock_event_bus = mock.create_autospec(EventBus, instance=True)
    handler = CreateShiftCommandHandler(
        mock_repo, Settings(app_name="test-app"), mock_event_bus
    )

    employee_id = uuid.uuid4().hex
    company_id = uuid.uuid4().hex
    shift_id = uuid.uuid4().hex

    command = CreateShiftCommand(
        shift_id=shift_id, employee_id=employee_id, company_id=company_id
    )
    handler.handle(command)

    published_events = mock_event_bus.publish.call_args[0][0]
    assert len(published_events) == 1
    event = published_events[0]
    assert isinstance(event, ShiftCreated)
