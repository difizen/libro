from pydantic import BaseModel
from .inspector import get_variable_dict_list


def is_langchain_installed():
    """
    Is LangChain installed?
    """
    try:
        import langchain

        return True
    except ImportError:
        return False


def langchain_variable(name) -> dict:
    from IPython import get_ipython

    ipython = get_ipython()
    from langchain_core.runnables import Runnable
    from langchain.chains import LLMChain
    from langchain_core.language_models.chat_models import BaseChatModel
    from langchain_core.language_models.chat_models import BaseChatModel

    def check_variable_type(name, cls):
        return name in ipython.user_ns and isinstance(ipython.user_ns[name], cls)

    runnable = check_variable_type(name, Runnable)
    is_chain = check_variable_type(name, LLMChain)
    is_chat_model = check_variable_type(name, BaseChatModel)
    if not runnable:
        return None
    return {
        "isChain": is_chain,
        "isChat": is_chat_model,
        "name": name,
    }


def get_langchain_variable_dict_list():
    if not is_langchain_installed():
        return []
    return get_variable_dict_list(langchain_variable)
