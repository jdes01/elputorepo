from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session

from ...settings import Settings


Base = declarative_base()


def init_sqlalchemy_session(settings: Settings) -> Session:
    return Session(
        autocommit=False,
        autoflush=False,
        bind=create_engine(
            settings.postgres_uri,
            connect_args={},
        ),
    )
