from .interpreter_provider import InterpreterChatObjectProvider
from .qwen_chat_provider import QwenChatObjectProvider
from .debug_provider import DebugChatObjectProvider
from .executor import LLMChat, ChatExecutor
from .openai_chat_provider import OpenAIChatObjectProvider
from .object_manager import ChatObjectManager
from .source import CHAT_SOURCE
from .object import ChatObject, ChatObjectProvider
from .langchain_variable import LangChainVariableChatObjectProvider
from .chat_record import ChatMessage, ChatRecord, ChatRecordProvider
from libro_core.config import libro_config

chat_object_manager = ChatObjectManager()
libro_ai_config = libro_config.get_config().get("llm")
type_of_model = []
api_key:str = None
if libro_ai_config is not None:
    if tongyi_api_key := libro_ai_config.get("DASHSCOPE_API_KEY"):
        api_key = tongyi_api_key
        chat_object_manager.register_provider(
            QwenChatObjectProvider(api_key=api_key))
        type_of_model.append('qwen')
    if openai_api_key := libro_ai_config.get("OPENAI_API_KEY"):
        api_key = openai_api_key
        chat_object_manager.register_provider(OpenAIChatObjectProvider(api_key = api_key))
        type_of_model.append('openai')
chat_object_manager.register_provider(LangChainVariableChatObjectProvider())
chat_object_manager.register_provider(DebugChatObjectProvider(type_of_model = type_of_model,api_key = api_key))
chat_object_manager.register_provider(InterpreterChatObjectProvider())

chat_record_provider = ChatRecordProvider()

__all__ = [
    "LLMChat",
    "ChatExecutor",
    "chat_object_manager",
    "chat_record_provider",
    "ChatObject",
    "ChatObjectProvider",
    "ChatMessage",
    "ChatRecord",
    "ChatRecordProvider",
    "CHAT_SOURCE",
]
