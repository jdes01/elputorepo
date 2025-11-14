from sqlalchemy import Engine, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session

from ...settings import Settings

Base = declarative_base()


def init_sqlalchemy_engine(settings: Settings) -> Engine:
    return create_engine(
        settings.postgres_uri,
        connect_args={},
    )


def init_sqlalchemy_session(engine: Engine) -> Session:
    return Session(
        autocommit=False,
        autoflush=False,
        bind=engine,
    )
