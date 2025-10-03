from dependency_injector.containers import DeclarativeContainer
from dependency_injector.providers import Container, Dependency, Factory

from src.apps.rest.core.employees.create_employee.controller import (
    CreateEmployeeController,
)
from src.apps.rest.core.employees.get_employees.controller import (
    GetEmployeesController,
)
from src.apps.rest.core.employees.router import EmployeesRouter
from src.apps.rest.core.router import CoreRouter
from src.contexts.core.infrastructure.container import CoreContainer
from src.contexts.shared.settings import Settings
from sqlalchemy.orm import Session


class CoreAPIContainer(DeclarativeContainer):
    # ============================== CONTAINER DEPENDENCIES ==============================

    settings = Dependency(instance_of=Settings)
    sqlalchemy_session = Dependency(instance_of=Session)

    # ====================================================================================

    core_container = Container(
        CoreContainer, settings=settings, sqlalchemy_session=sqlalchemy_session
    )

    get_employees_controller: Factory[GetEmployeesController] = Factory(
        GetEmployeesController,
        get_employees_use_case=core_container.container.get_employees_query_handler,
    )
    create_employee_controller = Factory(
        CreateEmployeeController,
        create_employee_use_case=core_container.container.create_employee_command_handler,
    )

    employees_router: Factory[EmployeesRouter] = Factory(
        EmployeesRouter,
        get_employees_controller=get_employees_controller,
        create_employee_controller=create_employee_controller,
    )

    # ============================== CONTAINER EXPORTS ===================================

    core_router: Factory[CoreRouter] = Factory(
        CoreRouter, employees_router=employees_router
    )

    # ====================================================================================
