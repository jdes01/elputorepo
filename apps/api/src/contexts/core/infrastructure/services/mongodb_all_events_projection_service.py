from returns.result import Failure, Result, Success

from src.contexts.core.application.services.event_projection_service import AllEventsProjectionService, EventProjection
from src.contexts.core.domain.value_objects.event_id import EventId

from ..mongo_projections.all_events_mongodb_projection import AllEventsProjectionSchema


class MongoAllEventsProjectionService(AllEventsProjectionService):
    def add(self, event_projection: EventProjection) -> Result[None, Exception]:
        try:
            projection = AllEventsProjectionSchema(event_id=event_projection.id, name=event_projection.name, capacity=event_projection.capacity)
            projection.save()
            return Success(None)
        except Exception as e:
            return Failure(Exception(f"Error adding event projection: {str(e)}"))

    def get(self, event_id: EventId) -> Result[EventProjection | None, Exception]:
        try:
            projection = AllEventsProjectionSchema.objects(event_id=event_id.value).first()
            if projection is None:
                return Success(None)
            return Success(EventProjection(id=projection.event_id, name=projection.name, capacity=projection.capacity))
        except Exception as e:
            return Failure(Exception(f"Error getting event projection: {str(e)}"))

    def get_all(self, limit: int | None = None, offset: int | None = None) -> Result[list[EventProjection], Exception]:
        try:
            query = AllEventsProjectionSchema.objects
            if offset is not None:
                query = query.skip(offset)
            if limit is not None:
                query = query.limit(limit)

            projection_list = list(query)

            events = [EventProjection(id=event.event_id, name=event.name, capacity=event.capacity) for event in projection_list]
            return Success(events)
        except Exception as e:
            return Failure(Exception(f"Error getting all event projections: {str(e)}"))

    def delete(self, event_id: EventId) -> Result[None, Exception]:
        try:
            projection = AllEventsProjectionSchema.objects(event_id=event_id.value).first()
            if projection:
                projection.delete()
            return Success(None)
        except Exception as e:
            return Failure(Exception(f"Error deleting event projection: {str(e)}"))
