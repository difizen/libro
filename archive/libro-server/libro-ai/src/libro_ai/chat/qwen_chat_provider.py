from typing import Dict, List

from .source import CHAT_SOURCE

from .executor import ChatExecutor
from .object import ChatObject, ChatObjectProvider, SupportInterpreter
from ..utils import is_langchain_installed
from .utils import ALIASE_NAME_MODEL, MODEL_NAME_ALIASES


class QwenChatObjectProvider(ChatObjectProvider):
    name: str = "qwen"
    cache: Dict[str, ChatExecutor] = {}
    LLMs: List[str] = ["qwen-max", "qwen-plus", "qwen-turbo"]
    LMMs: List[str] = []

    def get_or_create_executor(self, name: str) -> ChatExecutor:
        model = ALIASE_NAME_MODEL.get(name, name)
        if model in self.cache:
            return self.cache[model]
        from .qwen_chat_executor import QwenChat

        executor = QwenChat(model=model, name=name, api_key=self.api_key)
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
            )
        ]
