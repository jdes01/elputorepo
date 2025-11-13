from dependency_injector.containers import DeclarativeContainer
from dependency_injector.providers import Container, Dependency, Factory
from sqlalchemy.orm import Session

from src.apps.rest.core.events.create_event.controller import CreateEventController
from src.apps.rest.core.events.delete_event.controller import DeleteEventController
from src.apps.rest.core.events.get_all_events.controller import GetAllEventsController
from src.apps.rest.core.events.get_event.controller import GetEventController
from src.apps.rest.core.events.router import EventsRouter
from src.apps.rest.core.router import CoreRouter
from src.apps.rest.core.users.create_user.controller import CreateUserController
from src.apps.rest.core.users.router import UsersRouter
from src.contexts.core.infrastructure.container import CoreContainer
from src.contexts.shared.settings import Settings


class CoreAPIContainer(DeclarativeContainer):
    # ============================== CONTAINER DEPENDENCIES ==============================

    settings = Dependency(instance_of=Settings)
    sqlalchemy_session = Dependency(instance_of=Session)

    # ====================================================================================

    core_container = Container(CoreContainer, settings=settings, sqlalchemy_session=sqlalchemy_session)

    create_event_controller = Factory(
        CreateEventController,
        create_event_command_handler=core_container.container.create_event_command_handler,
    )

    delete_event_controller = Factory(
        DeleteEventController,
        delete_event_command_handler=core_container.container.delete_event_command_handler,
    )

    get_event_controller = Factory(
        GetEventController,
        get_event_by_id_query_handler=core_container.container.get_event_by_id_query_handler,
    )

    get_all_events_controller = Factory(
        GetAllEventsController,
        get_all_events_query_handler=core_container.container.get_all_events_query_handler,
    )

    events_router: Factory[EventsRouter] = Factory(
        EventsRouter,
        create_event_controller=create_event_controller,
        delete_event_controller=delete_event_controller,
        get_event_controller=get_event_controller,
        get_all_events_controller=get_all_events_controller,
    )

    create_user_controller = Factory(
        CreateUserController,
        create_user_command_handler=core_container.container.create_user_command_handler,
    )

    users_router: Factory[UsersRouter] = Factory(
        UsersRouter,
        create_user_controller=create_user_controller,
    )

    # ============================== CONTAINER EXPORTS ===================================

    core_router: Factory[CoreRouter] = Factory(
        CoreRouter,
        events_router=events_router,
        users_router=users_router,
    )

    # ====================================================================================
