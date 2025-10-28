from dataclasses import dataclass

from fastapi import APIRouter

from src.apps.rest.core.events.router import EventsRouter
from src.apps.rest.utils.router import Router


@dataclass
class CoreRouter(Router):
    events_router: EventsRouter

    def connect(self) -> APIRouter:
        router = APIRouter(tags=["Core"])
        router.include_router(self.events_router.connect())
        return router
