from abc import ABC, abstractmethod

from returns.result import Result

from ..application.utils.logging import log_handler_start
from .schemas import Schema


class QueryHandler[QueryType: Schema, ResultType](ABC):
    @abstractmethod
    def _handle(self, query: QueryType) -> Result[ResultType, Exception]:
        pass

    def handle(self, query: QueryType) -> Result[ResultType, Exception]:
        # Now Pylance knows model_dump exists
        query_dict = query.model_dump() if hasattr(query, "model_dump") else {}
        log_handler_start(self.__class__.__name__, **query_dict)
        return self._handle(query)
