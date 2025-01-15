from typing import List, Optional
from abc import ABC, abstractmethod
from pydantic import BaseModel
from typing import Callable
from enum import Enum
from .source import CHAT_SOURCE
from .executor import ChatExecutor

class SupportInterpreter(Enum):
    IMMUTABLE = "immutable"
    DYNAMIC = "dynamic"
    DISABLE = "disable"

class ChatObject(BaseModel):
    name: str = None
    type: str = CHAT_SOURCE["CUSTOM"]
    order: int = 0
    to_executor: Callable[[], ChatExecutor] = None
    api_key: Optional[str] = None
    support_interpreter: Optional[SupportInterpreter] = SupportInterpreter.DISABLE

    @property
    def key(self):
        return '%s:%s' % (self.type, self.name)

    def model_dump(self):
        '''Dump to dict'''
        return {
            **super().model_dump(exclude=["to_executor","support_interpreter"]),
            "support_interpreter":self.support_interpreter.value,
            "key": self.key
        }

class ChatObjectProvider(BaseModel, ABC):
    name: str = "custom"
    is_system_provider: bool = False
    api_key: Optional[str] = None

    @abstractmethod
    def list(self) -> List[ChatObject]:
        """List chat executors."""
