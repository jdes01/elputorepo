from dataclasses import dataclass

from fastapi import APIRouter

from src.apps.rest.core.events.router import EventsRouter
from src.apps.rest.core.users.router import UsersRouter
from src.contexts.shared.infrastructure.router import Router


@dataclass
class CoreRouter(Router):
    events_router: EventsRouter
    users_router: UsersRouter

    def connect(self) -> APIRouter:
        router = APIRouter(tags=["Core"])
        router.include_router(self.events_router.connect())
        router.include_router(self.users_router.connect())
        return router
