from dependency_injector.containers import DeclarativeContainer
from dependency_injector.providers import Factory, Dependency
from sqlalchemy.orm import Session

from src.contexts.core.application.commands.create_company.command_handler import (
    CreateCompanyCommandHandler,
)
from src.contexts.core.application.commands.create_employee.command_handler import (
    CreateEmployeeCommandHandler,
)
from src.contexts.core.application.commands.create_shift.command_handler import (
    CreateShiftCommandHandler,
)
from src.contexts.core.application.commands.end_shift.command_handler import (
    EndShiftCommandHandler,
)
from src.contexts.core.application.commands.pause_shift.command_handler import (
    PauseShiftCommandHandler,
)
from src.contexts.core.application.commands.resume_shift.command_handler import (
    ResumeShiftCommandHandler,
)
from src.contexts.core.application.commands.start_shift.command_handler import (
    StartShiftCommandHandler,
)
from src.contexts.core.application.events.on_shift_created_event_handler import (
    OnShiftCreatedEventHandler,
)
from src.contexts.core.application.queries.get_shift.query_handler import (
    GetShiftQueryHandler,
)
from src.contexts.core.domain.events.shift_created_domain_event import ShiftCreated
from src.contexts.core.domain.repositories.company_repository import CompanyRepository
from src.contexts.core.domain.repositories.employee_repository import EmployeeRepository
from src.contexts.core.domain.repositories.shift_repository import ShiftRepository
from src.contexts.core.infrastructure.repositories.postgres_company_repository import (
    PostgresCompanyRepository,
)
from src.contexts.core.infrastructure.repositories.postgres_shift_repository import (
    PostgresShiftRepository,
)
from src.contexts.shared.infrastructure.in_memory_event_bus import InMemoryEventBus
from src.contexts.shared.settings import Settings

from ..application import GetEmployeesQueryHandler
from ..infrastructure import (
    PostgresEmployeeRepository,
)


class CoreContainer(DeclarativeContainer):
    # ============================== CONTAINER DEPENDENCIES ==============================

    sqlalchemy_session = Dependency(instance_of=Session)
    settings = Dependency(instance_of=Settings)

    # ====================================================================================
    #
    # ============================== CONTAINER EXPORTS ===================================

    on_shift_created_event_handler = Factory(OnShiftCreatedEventHandler)

    event_bus = Factory(
        InMemoryEventBus,
        subscriptions={
            ShiftCreated: [on_shift_created_event_handler()],
        },
    )

    postgres_employee_repository: Factory[EmployeeRepository] = Factory(
        PostgresEmployeeRepository, session=sqlalchemy_session
    )

    postgres_company_repository: Factory[CompanyRepository] = Factory(
        PostgresCompanyRepository, session=sqlalchemy_session
    )

    postgres_shift_repository: Factory[ShiftRepository] = Factory(
        PostgresShiftRepository, session=sqlalchemy_session
    )

    get_employees_query_handler: Factory[GetEmployeesQueryHandler] = Factory(
        GetEmployeesQueryHandler,
        settings=settings,
        employee_repository=postgres_employee_repository,
    )

    create_employee_command_handler: Factory[CreateEmployeeCommandHandler] = Factory(
        CreateEmployeeCommandHandler,
        settings=settings,
        employee_repository=postgres_employee_repository,
        company_repository=postgres_company_repository,
    )

    create_company_command_handler: Factory[CreateCompanyCommandHandler] = Factory(
        CreateCompanyCommandHandler,
        settings=settings,
        company_repository=postgres_company_repository,
    )

    create_shift_command_handler: Factory[CreateShiftCommandHandler] = Factory(
        CreateShiftCommandHandler,
        settings=settings,
        shift_repository=postgres_shift_repository,
        event_bus=event_bus,
    )

    start_shift_command_handler: Factory[StartShiftCommandHandler] = Factory(
        StartShiftCommandHandler,
        settings=settings,
        shift_repository=postgres_shift_repository,
        event_bus=event_bus,
    )

    pause_shift_command_handler: Factory[PauseShiftCommandHandler] = Factory(
        PauseShiftCommandHandler,
        settings=settings,
        shift_repository=postgres_shift_repository,
        event_bus=event_bus,
    )

    resume_shift_command_handler: Factory[ResumeShiftCommandHandler] = Factory(
        ResumeShiftCommandHandler,
        settings=settings,
        shift_repository=postgres_shift_repository,
        event_bus=event_bus,
    )

    end_shift_command_handler: Factory[EndShiftCommandHandler] = Factory(
        EndShiftCommandHandler,
        settings=settings,
        shift_repository=postgres_shift_repository,
        event_bus=event_bus,
    )

    get_shift_query_handler: Factory[GetShiftQueryHandler] = Factory(
        GetShiftQueryHandler,
        settings=settings,
        shift_repository=postgres_shift_repository,
    )
    # ====================================================================================
