from typing import Any
from fastapi import APIRouter, Depends

from src.apps.rest.core.shifts.get_shift.request import (
    GetShiftRequest,
    get_shift_request,
)
from src.apps.rest.core.shifts.get_shift.response import GetShiftResponse
from src.apps.rest.utils.schemas import (
    ResponseMetaSchema,
    ResponseSchema,
    ResponseErrorSchema,
)
from src.contexts.core.application.queries.get_shift.query_handler import (
    GetShiftQuery,
    GetShiftQueryHandler,
)


class GetShiftController:
    get_shift_query_handler: GetShiftQueryHandler

    def __init__(self, get_shift_query_handler: GetShiftQueryHandler):
        self.get_shift_query_handler = get_shift_query_handler

    def connect(self, router: APIRouter) -> None:
        router.add_api_route(
            "/{shift_id}",
            self.handle_request,
            methods=["GET"],
            summary="Get a shift",
            response_model=ResponseSchema[GetShiftResponse],
        )

    def handle_request(
        self, request: GetShiftRequest = Depends(get_shift_request)
    ) -> ResponseSchema[GetShiftResponse]:
        try:
            get_shift_result = self.get_shift_query_handler.handle(
                GetShiftQuery(shift_id=request.shift_id)
            )

            return ResponseSchema[GetShiftResponse](
                data=GetShiftResponse(
                    shift=get_shift_result.shift,
                ),
                metadata=ResponseMetaSchema(count=1),
            )
        except Exception as e:
            return ResponseSchema[Any](
                message="Failure getting shift",
                data=None,
                metadata=None,
                errors=[ResponseErrorSchema(code="400", message=str(e))],
            )
