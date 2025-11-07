from abc import ABC, abstractmethod
from typing import Generic, TypeVar

from returns.result import Result

from src.contexts.shared.domain.schemas import Schema
from src.contexts.shared.infrastructure.logging import log_handler_start

Query = TypeVar("Query", bound=Schema)
ResultType = TypeVar("ResultType", bound=Schema)


class QueryHandler(ABC, Generic[Query, ResultType]):
    @abstractmethod
    def _handle(self, query: Query) -> Result[ResultType, Exception]:
        pass

    def handle(self, query: Query) -> Result[ResultType, Exception]:
        query_dict = query.model_dump() if hasattr(query, "model_dump") else {}
        log_handler_start(self.__class__.__name__, **query_dict)
        return self._handle(query)

