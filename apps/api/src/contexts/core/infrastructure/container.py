from dependency_injector.containers import DeclarativeContainer
from dependency_injector.providers import Dependency, Factory
from sqlalchemy.orm import Session

from src.contexts.core.domain.events.event_created_domain_event import EventCreated
from src.contexts.core.domain.events.user_created_domain_event import UserCreated
from src.contexts.core.domain.repositories.event_repository import EventRepository
from src.contexts.core.domain.repositories.user_repository import UserRepository
from src.contexts.core.infrastructure.repositories.postgres_event_repository import (
    PostgresEventRepository,
)
from src.contexts.core.infrastructure.repositories.postgres_user_repository import (
    PostgresUserRepository,
)
from src.contexts.shared.infrastructure.composite_event_bus import CompositeEventBus
from src.contexts.shared.infrastructure.in_memory_event_bus import InMemoryEventBus
from src.contexts.shared.infrastructure.rabbitmq_event_bus import RabbitMQEventBus
from src.contexts.shared.settings import Settings

from ..application.commands.create_event.command_handler import (
    CreateEventCommandHandler,
)
from ..application.commands.create_user.command_handler import (
    CreateUserCommandHandler,
)
from ..application.commands.delete_event.command_handler import (
    DeleteEventCommandHandler,
)
from ..application.events.on_event_created.event_handler import (
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

    in_memory_event_bus = Factory(
        InMemoryEventBus,
        subscriptions={
            EventCreated: [on_event_created_event_handler()],
            UserCreated: [],
        },
    )

    rabbitmq_event_bus = Factory(RabbitMQEventBus, settings=settings)

    event_bus = Factory(
        CompositeEventBus,
        in_memory_bus=in_memory_event_bus,
        rabbitmq_bus=rabbitmq_event_bus,
    )

    postgres_event_repository: Factory[EventRepository] = Factory(PostgresEventRepository, session=sqlalchemy_session)

    postgres_user_repository: Factory[UserRepository] = Factory(PostgresUserRepository, session=sqlalchemy_session)

    create_event_command_handler: Factory[CreateEventCommandHandler] = Factory(
        CreateEventCommandHandler,
        settings=settings,
        event_repository=postgres_event_repository,
        event_bus=event_bus,
    )

    create_user_command_handler: Factory[CreateUserCommandHandler] = Factory(
        CreateUserCommandHandler,
        settings=settings,
        user_repository=postgres_user_repository,
        event_bus=event_bus,
    )

    delete_event_command_handler: Factory[DeleteEventCommandHandler] = Factory(
        DeleteEventCommandHandler,
        event_repository=postgres_event_repository,
        event_bus=event_bus,
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
