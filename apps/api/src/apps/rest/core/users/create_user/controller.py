from fastapi import APIRouter, Depends, HTTPException, status
from logger.main import get_logger
from returns.result import Failure, Success

from src.apps.rest.core.users.create_user.request import (
    CreateUserRequest,
    create_user_request,
)
from src.apps.rest.core.users.create_user.response import CreateUserResponse
from src.contexts.core.application.commands.create_user.command_handler import (
    CreateUserCommand,
    CreateUserCommandHandler,
)
from src.contexts.shared import DomainError
from src.contexts.shared.domain.schemas import ResponseMetaSchema, ResponseSchema

logger = get_logger(__name__)


class CreateUserController:
    create_user_command_handler: CreateUserCommandHandler

    def __init__(self, create_user_command_handler: CreateUserCommandHandler):
        self.create_user_command_handler = create_user_command_handler

    def connect(self, router: APIRouter) -> None:
        router.add_api_route(
            "/{user_id}",
            self.handle_request,
            methods=["POST"],
            summary="Create a new user",
            response_model=ResponseSchema[CreateUserResponse],
        )

    def handle_request(self, request: CreateUserRequest = Depends(create_user_request)) -> ResponseSchema[CreateUserResponse]:
        result = self.create_user_command_handler.handle(CreateUserCommand(user_id=request.user_id, email=request.email))

        match result:
            case Success(value):
                return ResponseSchema[CreateUserResponse](
                    data=CreateUserResponse(user=value.user),
                    metadata=ResponseMetaSchema(count=1),
                )
            case Failure(error):
                if isinstance(error, DomainError):
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))
                logger.error("Error creating user", extra={"error": str(error)})
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

