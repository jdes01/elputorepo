from abc import ABC, abstractmethod

from returns.result import Result

from .query import Query
from .query_handler_result import QueryHandlerResult


class QueryHandler[Q: Query, R: QueryHandlerResult](ABC):
    @abstractmethod
    async def handle(self, query: Q) -> Result[R, Exception]:
        pass
