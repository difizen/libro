from typing import Optional
from libro_ai.chat.utils import executor_by_ipython
from pydantic import Field, ConfigDict

from .executor import LLMChat
from ..utils import is_langchain_installed
from langchain_community.chat_models.tongyi import ChatTongyi
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from IPython.display import display,clear_output
from langchain_core.runnables import Runnable
from langchain_core.tools import tool

@tool
def ipython_executor(code: str) -> int:
    """A Python code executor. Use this to execute python commands. Input should be a valid python command.

    Args:
        code: pytho code
    """
    executor_by_ipython(code)

class QwenChat(LLMChat):
    name: str = "qwen"
    model: str = Field(default="qwen-max")
    chat: ChatTongyi = None
    api_key: Optional[str] = None
    llm_with_tool: Optional[Runnable] = None
    interpreter_enabled: Optional[bool] = False
    model_config = ConfigDict(arbitrary_types_allowed=True)

    def load(self):
        if is_langchain_installed():
            extra_params = {}
            if self.api_key:
                extra_params["api_key"] = self.api_key
            self.chat = ChatTongyi(model_name=self.model, **extra_params)
            self.llm_with_tool = self.chat.bind_tools(
                [ipython_executor])
            return True
        return False

    def invoke_tool(self, res):
        tools = {"ipython_executor": ipython_executor,}
        for tool_call in res.tool_calls:
            selected_tool = tools[tool_call["name"].lower()]
            selected_tool.invoke(tool_call["args"])

    def run(self, value, language = None,stream=False, sync=True, system_prompt = None, **kwargs):
        if not self.chat:
            self.load()

        if isinstance(value, list):
            input = (
                [SystemMessage(content=system_prompt)] + value
                if system_prompt is not None
                else value
            )
        else:
            input = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=value.text),
            ] if system_prompt is not None else [HumanMessage(content=value.text)]
        
        if stream:
            try:
                if not self.chat or not self.llm_with_tool:
                    raise Exception("Chat model not loaded")
                chat = self.llm_with_tool if self.interpreter_enabled else self.chat
                if sync:
                    iter = chat.stream(input, streaming=True, **kwargs)
                else:
                    iter = chat.astream(input, streaming=True, **kwargs)
                return iter
            except Exception as e:

                return ""
        else:
            try:
                if not self.chat or not self.llm_with_tool:
                    raise Exception("Chat model not loaded")
                chat = self.llm_with_tool if self.interpreter_enabled else self.chat
                if sync:
                    result = chat.invoke(input, **kwargs)
                else:
                    result = chat.ainvoke(input, **kwargs)
                if self.interpreter_enabled:
                    self.invoke_tool(result)
                return result
            except Exception as e:
                return ""

    def display(self, value, **kwargs):
        if isinstance(value, str):
            data = {"application/vnd.libro.prompt+json": value}
            display(data, raw=True)
        if isinstance(value, AIMessage):
            data = {"application/vnd.libro.prompt+json": value.content}
            display(data, raw=True)
