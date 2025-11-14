from fastapi import Body, Path
from pydantic import BaseModel


class CreateEventRequest(BaseModel):
    event_id: str
    name: str
    capacity: int


class CreateEventBody(BaseModel):
    name: str
    capacity: int


CREATE_EVENT_DEFAULT_BODY = Body(...)


def create_event_request(
    event_id: str = Path(..., description="Event ID from the URL"),
    body: CreateEventBody = CREATE_EVENT_DEFAULT_BODY,
) -> CreateEventRequest:
    return CreateEventRequest(event_id=event_id, name=body.name, capacity=body.capacity)
