import json
from typing import Any, cast

from pydantic import BaseModel, ConfigDict


class CommandHandlerResult(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )

    def to_plain_values(self) -> dict[str, Any]:
        payload_json = self.model_dump_json(by_alias=True)
        data = json.loads(payload_json)
        return cast(dict[str, Any], data)
