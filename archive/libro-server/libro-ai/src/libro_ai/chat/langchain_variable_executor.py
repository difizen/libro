from ..utils import is_ipython
from .executor import ChatExecutor
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_core.prompt_values import StringPromptValue
from langchain.chains import LLMChain
from langchain_core.runnables import Runnable


class LangChainVariableChat(ChatExecutor):
    variable: dict = None

    def __init__(self, variable: dict):
        super().__init__(name=variable["name"])
        self.variable = variable

    def run(self, value:StringPromptValue,language = None,system_prompt = None, **kwargs):
        from IPython import get_ipython

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
            
        ipython = get_ipython()
        v: Runnable = ipython.user_ns[self.name]
        return v.invoke(input, **kwargs)

    def display(self, value, **kwargs):
        if is_ipython():
            from IPython.display import display

            if isinstance(value, str):
                data = {"application/vnd.libro.prompt+json": value}
                display(data, raw=True)
            if isinstance(value, AIMessage):
                data = {"application/vnd.libro.prompt+json": value.content}
                display(data, raw=True)
