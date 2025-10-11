from dependency_injector.containers import DeclarativeContainer
from dependency_injector.providers import Container, Dependency, Factory

from src.apps.rest.core.companies.create_company.controller import (
    CreateCompanyController,
)
from src.apps.rest.core.companies.router import CompaniesRouter
from src.apps.rest.core.employees.create_employee.controller import (
    CreateEmployeeController,
)
from src.apps.rest.core.employees.get_employees.controller import (
    GetEmployeesController,
)
from src.apps.rest.core.employees.router import EmployeesRouter
from src.apps.rest.core.router import CoreRouter
from src.apps.rest.core.shifts.create_shift.controller import CreateShiftController
from src.apps.rest.core.shifts.end_shift.controller import EndShiftController
from src.apps.rest.core.shifts.get_shift.controller import GetShiftController
from src.apps.rest.core.shifts.pause_shift.controller import PauseShiftController
from src.apps.rest.core.shifts.resume_shift.controller import ResumeShiftController
from src.apps.rest.core.shifts.router import ShiftsRouter
from src.apps.rest.core.shifts.start_shift.controller import StartShiftController
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

    create_shift_controller = Factory(
        CreateShiftController,
        create_shift_command_handler=core_container.container.create_shift_command_handler,
    )

    start_shift_controller = Factory(
        StartShiftController,
        start_shift_command_handler=core_container.container.start_shift_command_handler,
    )

    pause_shift_controller = Factory(
        PauseShiftController,
        pause_shift_command_handler=core_container.container.pause_shift_command_handler,
    )

    resume_shift_controller = Factory(
        ResumeShiftController,
        resume_shift_command_handler=core_container.container.resume_shift_command_handler,
    )

    end_shift_controller = Factory(
        EndShiftController,
        end_shift_command_handler=core_container.container.end_shift_command_handler,
    )

    create_company_controller = Factory(
        CreateCompanyController,
        create_company_command_handler=core_container.container.create_company_command_handler,
    )

    get_shift_controller = Factory(
        GetShiftController,
        get_shift_query_handler=core_container.container.get_shift_query_handler,
    )

    employees_router: Factory[EmployeesRouter] = Factory(
        EmployeesRouter,
        get_employees_controller=get_employees_controller,
        create_employee_controller=create_employee_controller,
    )

    shifts_router: Factory[ShiftsRouter] = Factory(
        ShiftsRouter,
        create_shift_controller=create_shift_controller,
        start_shift_controller=start_shift_controller,
        pause_shift_controller=pause_shift_controller,
        resume_shift_controller=resume_shift_controller,
        end_shift_controller=end_shift_controller,
        get_shift_controller=get_shift_controller,
    )

    companies_router: Factory[CompaniesRouter] = Factory(
        CompaniesRouter,
        create_company_controller=create_company_controller,
    )

    # ============================== CONTAINER EXPORTS ===================================

    core_router: Factory[CoreRouter] = Factory(
        CoreRouter,
        employees_router=employees_router,
        shifts_router=shifts_router,
        companies_router=companies_router,
    )

    # ====================================================================================

