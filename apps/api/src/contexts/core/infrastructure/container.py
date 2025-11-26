from dependency_injector.containers import DeclarativeContainer
from dependency_injector.providers import Dependency, Factory, Singleton
from sqlalchemy.orm import Session

from src.contexts.core.application.events.on_event_deleted.event_handler import OnEventDeletedEventHandler
from src.contexts.core.domain.events.event_created_domain_event import EventCreatedDomainEvent
from src.contexts.core.domain.events.event_deleted_domain_event import EventDeletedDomainEvent
from src.contexts.core.domain.events.user_created_domain_event import UserCreatedDomainEvent
from src.contexts.core.infrastructure.repositories.postgres_event_repository import (
    PostgresEventRepository,
)
from src.contexts.core.infrastructure.repositories.postgres_user_repository import (
    PostgresUserRepository,
)
from src.contexts.core.infrastructure.services.mongodb_all_events_projection_service import MongoAllEventsProjectionService
from src.contexts.shared.infrastructure.composite_event_bus import CompositeEventBus
from src.contexts.shared.infrastructure.in_memory_event_bus import InMemoryEventBus
from src.contexts.shared.infrastructure.logging.logger_provider import LoggerProvider
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
    sqlalchemy_session = Dependency(instance_of=Session)
    settings = Dependency(instance_of=Settings)

    logger = Singleton(LoggerProvider.provide, settings=settings)

    mongo_event_projection_service = Factory(MongoAllEventsProjectionService)

    on_event_created_event_handler = Factory(
        OnEventCreatedEventHandler,
        event_projection_service=mongo_event_projection_service,
        logger=logger,
    )

    on_event_deleted_event_handler = Factory(
        OnEventDeletedEventHandler,
        event_projection_service=mongo_event_projection_service,
        logger=logger,
    )

    in_memory_event_bus = Singleton(
        InMemoryEventBus,
        subscriptions={
            EventCreatedDomainEvent: [on_event_created_event_handler],
            EventDeletedDomainEvent: [on_event_deleted_event_handler],
            UserCreatedDomainEvent: [],
        },
        logger=logger,
    )

    rabbitmq_event_bus = Singleton(
        RabbitMQEventBus,
        settings=settings,
        logger=logger,
    )

    event_bus = Factory(
        CompositeEventBus,
        in_memory_bus=in_memory_event_bus,
        rabbitmq_bus=rabbitmq_event_bus,
    )

    postgres_event_repository = Factory(
        PostgresEventRepository,
        session=sqlalchemy_session,
        logger=logger,
    )

    postgres_user_repository = Factory(
        PostgresUserRepository,
        session=sqlalchemy_session,
        logger=logger,
    )

    create_event_command_handler = Factory(
        CreateEventCommandHandler,
        settings=settings,
        event_repository=postgres_event_repository,
        event_bus=event_bus,
        logger=logger,
    )

    create_user_command_handler = Factory(
        CreateUserCommandHandler,
        settings=settings,
        user_repository=postgres_user_repository,
        event_bus=event_bus,
        logger=logger,
    )

    delete_event_command_handler = Factory(
        DeleteEventCommandHandler,
        event_repository=postgres_event_repository,
        event_bus=event_bus,
        logger=logger,
    )

    get_event_by_id_query_handler = Factory(
        GetEventByIdQueryHandler,
        event_projection_service=mongo_event_projection_service,
        logger=logger,
    )

    get_all_events_query_handler = Factory(
        GetAllEventsQueryHandler,
        event_projection_service=mongo_event_projection_service,
        logger=logger,
    )
