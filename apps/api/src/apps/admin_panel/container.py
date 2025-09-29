from dependency_injector.containers import DeclarativeContainer
from dependency_injector.providers import Container, Factory

from .admin_panel_factory import AdminPanelFactory
from src.contexts.shared import SharedContainer


class AdminPanelContainer(DeclarativeContainer):
    # ============================== CONTAINER DEPENDENCIES ==============================

    shared_container = Container(SharedContainer)

    # ====================================================================================

    # ============================== CONTAINER EXPORTS ===================================

    admin_panel_factory: Factory[AdminPanelFactory] = Factory(
        AdminPanelFactory, engine=shared_container.container.sqlalchemy_engine
    )

    # ====================================================================================
