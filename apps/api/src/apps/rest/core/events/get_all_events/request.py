from fastapi import Query
from pydantic import BaseModel


class GetAllEventsRequest(BaseModel):
    limit: int
    offset: int


def get_all_events_request(limit: int = Query(10, ge=1, le=100), offset: int = Query(0, ge=0)) -> GetAllEventsRequest:
    return GetAllEventsRequest(limit=limit, offset=offset)
