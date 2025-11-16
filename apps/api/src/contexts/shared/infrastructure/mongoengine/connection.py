from collections.abc import Iterator
from contextlib import contextmanager

from mongoengine import connect
from pymongo import MongoClient

from src.contexts.shared.settings import Settings


@contextmanager
def mongo_engine_connection(settings: Settings) -> Iterator[MongoClient]:
    connection: MongoClient = connect(host=settings.mongodb_uri)  # type: ignore
    yield connection
