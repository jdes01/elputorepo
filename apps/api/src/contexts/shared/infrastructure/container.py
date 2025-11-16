from dependency_injector.containers import DeclarativeContainer
from dependency_injector.providers import Factory, Resource, Singleton
from pymongo import AsyncMongoClient
from sqlalchemy import Engine
from sqlalchemy.orm import Session

from src.contexts.shared.infrastructure.mongoengine.connection import mongo_engine_connection
from src.contexts.shared.settings import Settings

from .sqlalchemy import init_sqlalchemy_engine, init_sqlalchemy_session


class SharedContainer(DeclarativeContainer):
    # ============================== CONTAINER EXPORTS ===================================

    settings: Singleton[Settings] = Singleton(Settings)
    sqlalchemy_engine: Singleton[Engine] = Singleton(init_sqlalchemy_engine, settings=settings)
    sqlalchemy_session: Factory[Session] = Factory(init_sqlalchemy_session, engine=sqlalchemy_engine)
    # pymongo_client: Resource[MongoClient] = Resource(mongo_engine_connection, settings=settings)  # type: ignore
    pymongo_client: Resource[AsyncMongoClient] = Resource(mongo_engine_connection, settings=settings)  # type: ignore
    # ====================================================================================
