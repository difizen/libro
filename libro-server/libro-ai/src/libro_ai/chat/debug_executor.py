from typing import List, Optional, Union
from langchain_openai import ChatOpenAI
from langchain_community.chat_models.tongyi import ChatTongyi
from langchain.callbacks import get_openai_callback
from .executor import LLMChat
from ..utils import is_langchain_installed
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompt_values import StringPromptValue
from langchain_core.messages import AIMessage
from IPython.display import display
from libro_core.config import libro_config
from pydantic import Field

OPENAI = ['text-davinci-003',"gpt-4","gpt-4o","gpt-3.5-turbo"]
TONGYI = ["qwen-max","qwen-plus","qwen-turbo"]

class DebugChat(LLMChat):
    name: str = "debug"
    model: str = Field(default="gpt-4o")
    system_message: SystemMessage = SystemMessage(content="You are a code debugging assistant. When errors are encountered during notebook execution, you output some error messages. Please attempt to explain the error and provide a solution. Each conversation will include code and error messages. Please respond in the language type used in the input.")
    chat: Union[ChatOpenAI, ChatTongyi] = None
    api_key: Optional[str] = None
    type_of_model: List[str] = ['openai']

    def load(self):
        if is_langchain_installed():
            extra_params = {}
            config = libro_config.get_config().get('llm')
            if config is not None:
                default_model = config.get("default_model")
                self.model = default_model
                if default_model in OPENAI:
                    if api_key := config.get("OPENAI_API_KEY"):
                        extra_params["api_key"] = api_key
                        self.chat = ChatOpenAI(model_name=self.model,**extra_params)
                elif default_model in TONGYI:
                    if api_key := config.get("DASHSCOPE_API_KEY"):
                        extra_params["api_key"] = api_key
                        self.chat = ChatTongyi(model_name=self.model,**extra_params)
            return True
        return False

    def run(self, value:StringPromptValue, language = None, stream = False,sync=True,system_prompt = None,**kwargs):
        if not self.chat:
            self.load()
        # if language == 'en-US':
        #     self.system_message = SystemMessage(content="You are a code debugging assistant. When errors are encountered during notebook execution, you output some error messages. Please attempt to explain the error and provide a solution. Each conversation will include code and error messages. Please respond in the language type used in the input.")
        # else:
        #     self.system_message = SystemMessage(content="你是一个代码调试小助手，在 notebook 执行时，输出了一些报错信息，请尝试解释报错并给出解决方案，每次对话都会给出代码以及报错信息")
        if stream:
            try:
                if not self.chat:
                    raise Exception("Chat model not loaded")
                chat = self.chat
                human_message = HumanMessage(content=value.text)
                with get_openai_callback() as cb:
                    if sync:
                        result = chat.stream([self.system_message,human_message], **kwargs)
                        return result
                    else:
                        result = chat.astream([self.system_message,human_message], **kwargs)
                        return result
            except Exception as e:
                return ""
        else:
            try:
                if not self.chat:
                    raise Exception("Chat model not loaded")
                chat = self.chat
                human_message = HumanMessage(content=value.text)
                with get_openai_callback() as cb:
                    if sync:
                        result = chat.invoke([self.system_message,human_message], **kwargs)
                    else:
                        result = chat.ainvoke([self.system_message,human_message], **kwargs)
                    return result.content
            except Exception as e:
                return ""
            
    def display(self, value, **kwargs):
        if isinstance(value, str):
            data = {"application/vnd.libro.prompt+json": value}
            display(data, raw=True)
        if isinstance(value, AIMessage):
            data = {"application/vnd.libro.prompt+json": value.content}
            display(data, raw=True)