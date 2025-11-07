# tests/conftest.py
from typing import Any, Generator

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from testcontainers.postgres import PostgresContainer  # type: ignore

from src.contexts.shared.infrastructure.sqlalchemy.connection import Base


@pytest.fixture(scope="session")
def postgres_container() -> Generator[PostgresContainer, Any, Any]:
    with PostgresContainer("postgres:15") as postgres:
        yield postgres


@pytest.fixture
def postgres_session(postgres_container: PostgresContainer):
    engine = create_engine(postgres_container.get_connection_url())
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()
    Base.metadata.drop_all(engine)
    engine.dispose()
