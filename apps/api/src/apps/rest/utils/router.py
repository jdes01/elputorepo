from abc import ABC, abstractmethod

from fastapi import APIRouter


class Router(ABC):
    @abstractmethod
    def connect(self) -> APIRouter:
        pass
