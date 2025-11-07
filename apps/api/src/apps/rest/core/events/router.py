from dataclasses import dataclass

from fastapi import APIRouter

from src.apps.rest.core.events.create_event.controller import (
    CreateEventController,
)
from src.apps.rest.core.events.delete_event.controller import (
    DeleteEventController,
)
from src.apps.rest.core.events.get_all_events.controller import (
    GetAllEventsController,
)
from src.apps.rest.core.events.get_event.controller import (
    GetEventController,
)
from src.contexts.shared.infrastructure.router import Router


@dataclass
class EventsRouter(Router):
    create_event_controller: CreateEventController
    delete_event_controller: DeleteEventController
    get_event_controller: GetEventController
    get_all_events_controller: GetAllEventsController

    def connect(self) -> APIRouter:
        router = APIRouter(prefix="/events")
        self.create_event_controller.connect(router)
        self.delete_event_controller.connect(router)
        self.get_event_controller.connect(router)
        self.get_all_events_controller.connect(router)
        return router
