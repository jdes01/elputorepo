from fastapi import APIRouter, Depends, HTTPException, status
from returns.result import Success

from src.contexts.core.application.queries.get_all_events.query_handler import (
    GetAllEventsQuery,
    GetAllEventsQueryHandler,
    GetAllEventsResult,
)
from src.contexts.shared.domain.schemas import ResponseMetaSchema, ResponseSchema

from .request import GetAllEventsRequest, get_all_events_request

GET_ALL_EVENT_REQUEST = Depends(get_all_events_request)


class GetAllEventsController:
    get_all_events_query_handler: GetAllEventsQueryHandler

    def __init__(self, get_all_events_query_handler: GetAllEventsQueryHandler):
        self.get_all_events_query_handler = get_all_events_query_handler

    def connect(self, router: APIRouter) -> None:
        router.add_api_route(
            "",
            self.handle_request,
            methods=["GET"],
            summary="Get all events",
            response_model=ResponseSchema[GetAllEventsResult],
        )

    async def handle_request(self, request: GetAllEventsRequest = GET_ALL_EVENT_REQUEST) -> ResponseSchema[GetAllEventsResult]:
        result = await self.get_all_events_query_handler.handle(GetAllEventsQuery(limit=request.limit, offset=request.offset))

        if isinstance(result, Success):
            return ResponseSchema[GetAllEventsResult](
                data=result.unwrap(),
                metadata=ResponseMetaSchema(count=len(result.unwrap().events)),
            )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
