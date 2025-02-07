from typing import Dict, List

from .source import CHAT_SOURCE

from .executor import ChatExecutor
from .object import ChatObject, ChatObjectProvider, SupportInterpreter
from ..utils import is_langchain_installed
from .utils import ALIASE_NAME_MODEL, MODEL_NAME_ALIASES


class OpenAIChatObjectProvider(ChatObjectProvider):
    name: str = "openai"
    cache: Dict[str, ChatExecutor] = {}
    LLMs: List[str] = ["gpt-3.5-turbo", "gpt-4"]
    LMMs: List[str] = ["dall-e-3"]

    def get_or_create_executor(self, name: str) -> ChatExecutor:
        model = ALIASE_NAME_MODEL.get(name, name)
        if model in self.cache:
            return self.cache[model]
        from .openai_chat_executor import OpenAIChat

        if self.api_key is not None:
            executor = OpenAIChat(model=model, name=name, api_key=self.api_key)
        else:
            executor = OpenAIChat(model=model, name=name)
        if executor.load():
            self.cache[model] = executor
        return executor

    def get_or_create_lmm_executor(self, name: str) -> ChatExecutor:
        model = ALIASE_NAME_MODEL.get(name, name)
        if model in self.cache:
            return self.cache[model]
        from .openai_chat_executor import DalleChat

        executor = DalleChat(model=model, name=name, api_key=self.api_key)
        if executor.load():
            self.cache[model] = executor
        return executor

    def list(self) -> List[ChatObject]:
        if not is_langchain_installed():
            return []
        return [
            *list(
                map(
                    lambda n: ChatObject(
                        name=MODEL_NAME_ALIASES.get(n, n),
                        to_executor=lambda: self.get_or_create_executor(n),
                        type=CHAT_SOURCE["LLM"],
                        support_interpreter=SupportInterpreter.DYNAMIC
                    ),
                    self.LLMs,
                )
            ),
            *list(
                map(
                    lambda n: ChatObject(
                        name=MODEL_NAME_ALIASES.get(n, n),
                        to_executor=lambda: self.get_or_create_lmm_executor(n),
                        type=CHAT_SOURCE["LMM"],
                        support_interpreter=SupportInterpreter.DISABLE
                    ),
                    self.LMMs,
                )
            ),
        ]
