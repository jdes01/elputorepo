from fastapi import Path
from pydantic import BaseModel


class PauseShiftRequest(BaseModel):
    shift_id: str


def pause_shift_request(
    shift_id: str = Path(..., description="Shift ID from the URL"),
) -> PauseShiftRequest:
    return PauseShiftRequest(shift_id=shift_id)
