from fastapi import Query
from pydantic import BaseModel


class GetAllEventsRequest(BaseModel):
    limit: int | None = None
    offset: int | None = None


def get_all_events_request(limit: int | None = Query(None, ge=1, le=100), offset: int = Query(None, ge=0)) -> GetAllEventsRequest:
    return GetAllEventsRequest(limit=limit, offset=offset)
