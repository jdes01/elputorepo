from dataclasses import dataclass

from fastapi import APIRouter

from src.apps.rest.core.users.create_user.controller import (
    CreateUserController,
)
from src.contexts.shared.infrastructure.router import Router


@dataclass
class UsersRouter(Router):
    create_user_controller: CreateUserController

    def connect(self) -> APIRouter:
        router = APIRouter(prefix="/users")
        self.create_user_controller.connect(router)
        return router
