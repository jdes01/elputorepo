from collections.abc import AsyncIterator

from beanie import init_beanie
from pymongo import AsyncMongoClient

from src.contexts.core.infrastructure.mongo_projections.all_events_mongodb_projection import AllEventsProjectionSchema
from src.contexts.shared.settings import Settings


async def mongo_engine_connection(settings: Settings) -> AsyncIterator[AsyncMongoClient]:
    client: AsyncMongoClient = AsyncMongoClient(settings.mongodb_uri)
    db = client[settings.mongodb_database_name]

    await init_beanie(database=db, document_models=[AllEventsProjectionSchema])
    try:
        yield client
    finally:
        await client.close()
