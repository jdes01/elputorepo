from fastapi import Path
from pydantic import BaseModel


class GetShiftRequest(BaseModel):
    shift_id: str


def get_shift_request(
    shift_id: str = Path(..., description="Shift ID from the URL"),
) -> GetShiftRequest:
    return GetShiftRequest(shift_id=shift_id)
