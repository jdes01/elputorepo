from dependency_injector.containers import DeclarativeContainer
from dependency_injector.providers import Factory, Dependency
from sqlalchemy.orm import Session

from src.contexts.core.application.commands.create_employee_command_handler import (
    CreateEmployeeCommandHandler,
)
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

    postgres_employee_repository: Factory[PostgresEmployeeRepository] = Factory(
        PostgresEmployeeRepository, session=sqlalchemy_session
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
    )

    # ====================================================================================
