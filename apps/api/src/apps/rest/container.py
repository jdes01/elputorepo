from dependency_injector.containers import DeclarativeContainer
from dependency_injector.providers import Container, Factory

from src.apps.rest.core.container import CoreAPIContainer
from src.apps.rest.utils.app_factory import AppFactory
from src.contexts.shared import SharedContainer


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
        AppFactory, core_router=core_api_container.container.core_router
    )

    # ====================================================================================
