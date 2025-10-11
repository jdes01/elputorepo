from fastapi import Path
from pydantic import BaseModel


class EndShiftRequest(BaseModel):
    shift_id: str


def end_shift_request(
    shift_id: str = Path(..., description="Shift ID from the URL"),
) -> EndShiftRequest:
    return EndShiftRequest(shift_id=shift_id)
