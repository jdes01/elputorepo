from dependency_injector.providers import Singleton, Factory
from dependency_injector.containers import DeclarativeContainer
from sqlalchemy import Engine
from sqlalchemy.orm import Session


from .sqlalchemy import init_sqlalchemy_session, init_sqlalchemy_engine
from src.contexts.shared.settings import Settings


class SharedContainer(DeclarativeContainer):
    # ============================== CONTAINER EXPORTS ===================================

    settings: Singleton[Settings] = Singleton(Settings)
    sqlalchemy_engine: Singleton[Engine] = Singleton(
        init_sqlalchemy_engine, settings=settings
    )
    sqlalchemy_session: Factory[Session] = Factory(
        init_sqlalchemy_session, engine=sqlalchemy_engine
    )

    # ====================================================================================
