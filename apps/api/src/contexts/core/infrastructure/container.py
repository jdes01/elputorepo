from dependency_injector.containers import DeclarativeContainer
from dependency_injector.providers import Factory, Dependency
from sqlalchemy.orm import Session

from src.contexts.shared.settings import Settings

from ..application import GetPizzasQueryHandler
from ..infrastructure import (
    PostgresPizzaRepository,
)


class CoreContainer(DeclarativeContainer):
    # ============================== CONTAINER DEPENDENCIES ==============================

    sqlalchemy_session = Dependency(instance_of=Session)
    settings = Dependency(instance_of=Settings)

    # ====================================================================================
    #
    # ============================== CONTAINER EXPORTS ===================================

    postgres_pizza_repository: Factory[PostgresPizzaRepository] = Factory(
        PostgresPizzaRepository, session=sqlalchemy_session
    )

    get_pizzas_query_handler: Factory[GetPizzasQueryHandler] = Factory(
        GetPizzasQueryHandler,
        settings=settings,
        pizza_repository=postgres_pizza_repository,
    )

    # ====================================================================================
