from fastapi import Body, Path
from pydantic import BaseModel


class CreateEventRequest(BaseModel):
    event_id: str
    name: str


class CreateEventBody(BaseModel):
    name: str


def create_event_request(
    event_id: str = Path(..., description="Event ID from the URL"),
    body: CreateEventBody = Body(...),
) -> CreateEventRequest:
    return CreateEventRequest(event_id=event_id, name=body.name)
