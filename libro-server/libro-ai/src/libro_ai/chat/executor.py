from abc import ABC, abstractmethod
import requests
from pydantic import BaseModel
from typing import Any, Dict, Optional

from ..utils import is_ipython


class ChatExecutor(BaseModel, ABC):
    name: str = "custom"
    order: int = 0
    interpreter_enabled: Optional[bool] = False

    @abstractmethod
    def run(
        self,
        value,
        stream = False,
        **kwargs,
    ) -> Any:
        """Chat and get result."""

    def display(
        self,
        value,
        **kwargs,
    ):
        data = {"application/vnd.libro.prompt+json": value}
        if is_ipython():
            from IPython.display import display

            display(data, raw=True)

    def set_interpreter_support(self,support: bool):
        self.interpreter_enabled = support

class LLMChat(ChatExecutor):
    name: str = "custom"

    @abstractmethod
    def load(self, config: dict) -> bool:
        """Load LLM from Config Dict."""


class APIChat(ChatExecutor):
    name: str = "api"
    url: str
    headers: Dict[str, str]
    data: Dict[str, Any]

    def get_request_config(self):
        return {"url": self.url, "headers": self.headers, "json": self.data}

    def handle_request(self, value, **kwargs):
        handled_request_config = {
            **self.get_request_config(),
            **kwargs,
        }
        return handled_request_config

    def handle_response(self, response):
        return response

    def run(self, value, **kwargs):
        config = self.handle_request(value, **kwargs)
        result = requests.post(**config)
        handled_result = self.handle_response(result.json())
        return handled_result
