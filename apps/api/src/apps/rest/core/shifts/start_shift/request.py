from fastapi import Path
from pydantic import BaseModel


class StartShiftRequest(BaseModel):
    shift_id: str


def start_shift_request(
    shift_id: str = Path(..., description="Shift ID from the URL"),
) -> StartShiftRequest:
    return StartShiftRequest(shift_id=shift_id)
