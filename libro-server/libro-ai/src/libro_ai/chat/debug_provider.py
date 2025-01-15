from typing import Dict, List
from .source import CHAT_SOURCE
from .executor import ChatExecutor
from .object import ChatObject, ChatObjectProvider, SupportInterpreter
from ..utils import is_langchain_installed

MODEL_NAME_ALIASES = {
    "gpt-3.5-turbo": "debug-chatgpt",
    "gpt-4": "debug-gpt4",
}

class DebugChatObjectProvider(ChatObjectProvider):
    name: str = "debug"
    cache: Dict[str, ChatExecutor] = {}
    LLMs: List[str] = ["gpt-3.5-turbo", "gpt-4"]
    type_of_model: List[str] = ['openai']
    is_system_provider: bool = True

    def get_or_create_executor(self, name: str) -> ChatExecutor:
        if name in self.cache:
            return self.cache[name]
        from .debug_executor import DebugChat

        executor = DebugChat(model=name, name=name, type_of_model = self.type_of_model, api_key=self.api_key)
        if executor.load():
            self.cache[name] = executor
        return executor  

    def list(self) -> List[ChatObject]:
        if not is_langchain_installed():
            return []
        return [
            *list(
                map(
                    lambda n: ChatObject(
                        name='debug',
                        to_executor=lambda: self.get_or_create_executor(n),
                        type=CHAT_SOURCE["LLM"],
                        support_interpreter=SupportInterpreter.DISABLE
                    ),
                    self.LLMs,
                )
            ),  
        ]
