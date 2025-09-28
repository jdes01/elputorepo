from dependency_injector.providers import Singleton
from dependency_injector.containers import DeclarativeContainer
from sqlalchemy.orm import Session

from .sqlalchemy import (
    init_sqlalchemy_session,
)
from src.contexts.shared.settings import Settings


class SharedContainer(DeclarativeContainer):
    # ============================== CONTAINER EXPORTS ===================================

    settings: Singleton[Settings] = Singleton(Settings)
    sqlalchemy_session: Singleton[Session] = Singleton(
        init_sqlalchemy_session, settings=settings
    )

    # ====================================================================================
