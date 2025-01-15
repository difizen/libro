from typing import List
from abc import ABC, abstractmethod
from pydantic import BaseModel
from typing import Callable

from .source import CHAT_SOURCE
from .executor import ChatExecutor


class ChatObject(BaseModel):
    name: str = None
    type: str = CHAT_SOURCE["CUSTOM"]
    order: int = 0
    to_executor: Callable[[], ChatExecutor] = None

    @property
    def key(self):
        return "%s:%s" % (self.type, self.name)

    def model_dump(self):
        """Dump to dict"""
        return {**super().model_dump(exclude="to_executor"), "key": self.key}


class ChatObjectProvider(BaseModel, ABC):
    name: str = "custom"

    @abstractmethod
    def list(self) -> List[ChatObject]:
        """List chat executors."""
