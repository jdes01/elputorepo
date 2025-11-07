from pydantic import BaseModel, Field


class EventCreated(BaseModel):
    """EventCreated domain event contract."""
    event_id: str = Field(..., description="Event ID (UUID)")
    name: str | None = Field(None, description="Event name")
    capacity: int = Field(..., gt=0, description="Event capacity")
    timestamp: str | None = Field(None, description="Event timestamp")


class EventDeleted(BaseModel):
    """EventDeleted domain event contract."""
    event_id: str = Field(..., description="Event ID (UUID)")
    timestamp: str | None = Field(None, description="Event timestamp")


class UserCreated(BaseModel):
    """UserCreated domain event contract."""
    user_id: str = Field(..., description="User ID (UUID)")
    email: str = Field(..., description="User email")
    timestamp: str | None = Field(None, description="Event timestamp")


class TicketAcquired(BaseModel):
    """TicketAcquired domain event contract."""
    ticketId: str = Field(..., description="Ticket ID (UUID)")
    eventId: str = Field(..., description="Event ID (UUID)")
    userId: str = Field(..., description="User ID (UUID)")
    timestamp: str | None = Field(None, description="Event timestamp")


__all__ = ["EventCreated", "EventDeleted", "UserCreated", "TicketAcquired"]

