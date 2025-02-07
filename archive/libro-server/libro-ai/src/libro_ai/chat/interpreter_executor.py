from libro_ai.chat.utils import executor_by_ipython
from pydantic import ConfigDict, Field
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_core.prompt_values import StringPromptValue
from langchain_core.runnables import Runnable
from langchain_community.callbacks.manager import get_openai_callback
from langchain_core.tools import tool
from IPython.display import display, clear_output
from libro_core.config import libro_config
import re

from .executor import LLMChat
from ..utils import is_langchain_installed

@tool
def ipython_executor(code: str) -> int:
    """A Python code executor. Use this to execute python commands. Input should be a valid python command.

    Args:
        code: pytho code
    """

    executor_by_ipython(code)

class InterpreterChat(LLMChat):
    name: str = "interpreter"
    model: str = Field(default="gpt-4o")
    chat: ChatOpenAI = None
    llm_with_tool: Runnable = None

    model_config = ConfigDict(arbitrary_types_allowed=True)

    def load(self):
        if is_langchain_installed():
            extra_params = {}
            libro_ai_config = libro_config.get_config().get("llm")
            if libro_ai_config is not None:
                if api_key := libro_ai_config.get("OPENAI_API_KEY"):
                    extra_params["api_key"] = api_key
            self.chat = ChatOpenAI(model_name=self.model, **extra_params)
            self.llm_with_tool = self.chat.bind_tools(
                [ipython_executor])
            return True
        return False

    def invoke_tool(self, res):
        tools = {"ipython_executor": ipython_executor,}
        for tool_call in res.tool_calls:
            selected_tool = tools[tool_call["name"].lower()]
            selected_tool.invoke(tool_call["args"])

    def run(self, value: StringPromptValue, stream=True, sync=True, system_prompt=None, **kwargs):
        if not self.chat:
            self.load()
        input = [SystemMessage(content="You are a very useful assistant. When a user's problem can be solved with code, you generate Python code and execute it. These codes will run in an IPython environment and be displayed in a notebook, so you can use code commonly used in notebooks to get the job done."),
                 HumanMessage(content=value.text)]

        if stream:
            try:
                if not self.llm_with_tool:
                    raise Exception("Chat model not loaded")
                chat = self.llm_with_tool
                with get_openai_callback() as cb:
                    iter = chat.stream(input, **kwargs)
                    first = True
                    gathered = None
                    for chunk in iter:
                        if first:
                            gathered = chunk
                            first = False
                        else:
                            gathered = gathered + chunk
                        clear_output(wait=True)
                        self.display(gathered.content)
                    self.invoke_tool(gathered)
                    return None
            except Exception as e:
                return ""
        else:
            try:
                if not self.llm_with_tool:
                    raise Exception("Chat model not loaded")
                chat = self.llm_with_tool
                with get_openai_callback() as cb:
                    result = chat.invoke(input, **kwargs)
                    self.display(result)
                    self.invoke_tool(result)
                    return None
            except Exception as e:
                return ""

    def display(self, value, **kwargs):
        if isinstance(value, str):
            data = {"application/vnd.libro.prompt+json": value}
            display(data, raw=True)
        if isinstance(value, AIMessage):
            data = {"application/vnd.libro.prompt+json": value.content}
            display(data, raw=True)
