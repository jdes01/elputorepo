from dependency_injector.containers import DeclarativeContainer
from dependency_injector.providers import Dependency, Factory
from sqlalchemy.orm import Session

from src.contexts.core.domain.events.event_created_domain_event import EventCreated
from src.contexts.core.domain.repositories.event_repository import EventRepository
from src.contexts.core.infrastructure.repositories.postgres_event_repository import (
    PostgresEventRepository,
)
from src.contexts.shared.infrastructure.in_memory_event_bus import InMemoryEventBus
from src.contexts.shared.settings import Settings

from ..application.commands.create_event.command_handler import (
    CreateEventCommandHandler,
)
from ..application.commands.delete_event.command_handler import (
    DeleteEventCommandHandler,
)
from ..application.events.on_event_created_event_handler import (
    OnEventCreatedEventHandler,
)
from ..application.queries.get_all_events.query_handler import (
    GetAllEventsQueryHandler,
)
from ..application.queries.get_event_by_id.query_handler import (
    GetEventByIdQueryHandler,
)


class CoreContainer(DeclarativeContainer):
    # ============================== CONTAINER DEPENDENCIES ==============================

    sqlalchemy_session = Dependency(instance_of=Session)
    settings = Dependency(instance_of=Settings)

    # ====================================================================================
    #
    # ============================== CONTAINER EXPORTS ===================================

    on_event_created_event_handler = Factory(OnEventCreatedEventHandler)

    event_bus = Factory(
        InMemoryEventBus,
        subscriptions={
            EventCreated: [on_event_created_event_handler()],
        },
    )

    postgres_event_repository: Factory[EventRepository] = Factory(
        PostgresEventRepository, session=sqlalchemy_session
    )

    create_event_command_handler: Factory[CreateEventCommandHandler] = Factory(
        CreateEventCommandHandler,
        settings=settings,
        event_repository=postgres_event_repository,
    )

    delete_event_command_handler: Factory[DeleteEventCommandHandler] = Factory(
        DeleteEventCommandHandler,
        event_repository=postgres_event_repository,
    )

    get_event_by_id_query_handler: Factory[GetEventByIdQueryHandler] = Factory(
        GetEventByIdQueryHandler,
        event_repository=postgres_event_repository,
    )

    get_all_events_query_handler: Factory[GetAllEventsQueryHandler] = Factory(
        GetAllEventsQueryHandler,
        event_repository=postgres_event_repository,
    )

    # ====================================================================================
