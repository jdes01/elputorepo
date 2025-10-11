from fastapi import Path
from pydantic import BaseModel


class ResumeShiftRequest(BaseModel):
    shift_id: str


def resume_shift_request(
    shift_id: str = Path(..., description="Shift ID from the URL"),
) -> ResumeShiftRequest:
    return ResumeShiftRequest(shift_id=shift_id)
