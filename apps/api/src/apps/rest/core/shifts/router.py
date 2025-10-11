from dataclasses import dataclass

from fastapi import APIRouter

from src.apps.rest.core.shifts.create_shift.controller import CreateShiftController
from src.apps.rest.core.shifts.end_shift.controller import EndShiftController
from src.apps.rest.core.shifts.get_shift.controller import GetShiftController
from src.apps.rest.core.shifts.pause_shift.controller import PauseShiftController
from src.apps.rest.core.shifts.resume_shift.controller import ResumeShiftController
from src.apps.rest.core.shifts.start_shift.controller import StartShiftController
from src.apps.rest.utils.router import Router


@dataclass
class ShiftsRouter(Router):
    create_shift_controller: CreateShiftController
    start_shift_controller: StartShiftController
    pause_shift_controller: PauseShiftController
    resume_shift_controller: ResumeShiftController
    end_shift_controller: EndShiftController
    get_shift_controller: GetShiftController

    def connect(self) -> APIRouter:
        router = APIRouter(prefix="/shifts")
        self.create_shift_controller.connect(router)
        self.start_shift_controller.connect(router)
        self.pause_shift_controller.connect(router)
        self.resume_shift_controller.connect(router)
        self.end_shift_controller.connect(router)
        self.get_shift_controller.connect(router)
        return router
