from dataclasses import dataclass

from fastapi import APIRouter

from src.apps.rest.core.events.create_event.controller import (
    CreateEventController,
)
from src.apps.rest.utils.router import Router


@dataclass
class EventsRouter(Router):
    create_event_controller: CreateEventController

    def connect(self) -> APIRouter:
        router = APIRouter(prefix="/events")
        self.create_event_controller.connect(router)
        return router
