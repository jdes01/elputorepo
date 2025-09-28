from __future__ import annotations

import json
from typing import Any

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class Schema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

    def to_plain_values(self) -> dict[str, Any]:
        payload_json = self.model_dump_json(by_alias=True)
        return json.loads(payload_json)


class ResponseErrorSchema(Schema):
    code: str
    message: str


class ResponseMetaSchema(Schema):
    count: int | None = None


class ResponseSchema[T](Schema):
    message: str = "OK"
    data: T | None = None
    errors: list[ResponseErrorSchema] | None = None
    metadata: ResponseMetaSchema | None = None
