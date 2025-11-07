from dependency_injector.containers import DeclarativeContainer
from dependency_injector.providers import Container, Factory

from src.apps.rest.core.container import CoreAPIContainer
from src.contexts.shared import SharedContainer
from src.contexts.shared.infrastructure.app_factory import AppFactory


class MainContainer(DeclarativeContainer):
    # ============================== CONTAINER DEPENDENCIES ==============================

    shared_container = Container(SharedContainer)

    # ====================================================================================

    core_api_container = Container(
        CoreAPIContainer,
        settings=shared_container.container.settings,
        sqlalchemy_session=shared_container.container.sqlalchemy_session,
    )

    # ============================== CONTAINER EXPORTS ===================================

    app_factory: Factory[AppFactory] = Factory(
        AppFactory,
        routers=lambda: [],  # Will be overridden in main.py
        settings=shared_container.container.settings,
    )

    # ====================================================================================
