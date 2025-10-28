from dependency_injector.containers import DeclarativeContainer
from dependency_injector.providers import Container, Dependency, Factory

from src.apps.rest.core.events.create_event.controller import CreateEventController
from src.apps.rest.core.events.router import EventsRouter
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

    create_event_controller = Factory(
        CreateEventController,
        create_event_command_handler=core_container.container.create_event_command_handler,
    )

    events_router: Factory[EventsRouter] = Factory(
        EventsRouter,
        create_event_controller=create_event_controller,
    )

    # ============================== CONTAINER EXPORTS ===================================

    core_router: Factory[CoreRouter] = Factory(
        CoreRouter,
        events_router=events_router,
    )

    # ====================================================================================
