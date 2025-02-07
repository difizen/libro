from typing import List

from .source import CHAT_SOURCE
from .executor import ChatExecutor
from .object import ChatObject, ChatObjectProvider, SupportInterpreter
from ..utils import is_langchain_installed
from .interpreter_executor import InterpreterChat


class InterpreterChatObjectProvider(ChatObjectProvider):
    name: str = "interpreter"
    executor: InterpreterChat = None

    def get_or_create_executor(self) -> ChatExecutor:
        executor = InterpreterChat()
        if executor.load():
            self.executor = executor
        return executor

    def list(self) -> List[ChatObject]:
        if not is_langchain_installed():
            return []
        return [
            ChatObject(
                name=self.name,
                to_executor=lambda: self.get_or_create_executor(),
                type=CHAT_SOURCE["LLM"],
                support_interpreter=SupportInterpreter.IMMUTABLE
            )
        ]
