from typing import List, Union
from langchain.schema.messages import BaseMessage
from langchain_core.prompt_values import StringPromptValue
import re
from IPython.display import display

MODEL_NAME_ALIASES = {
    "text-davinci-003": "gpt3",
    "gpt-3.5-turbo": "chatgpt",
    "gpt-4": "gpt4",
    "dall-e-3": "dalle-3",
    "dall-e-2": "dalle-2",
    "qwen-max": "qwen-max",
    "qwen-plus": "qwen-plus",
    "qwen-turbo": "qwen-turbo",
}

ALIASE_NAME_MODEL = {
    "gpt3": "text-davinci-003",
    "chatgpt": "gpt-3.5-turbo",
    "gpt4": "gpt-4",
    "dalle-3": "dall-e-3",
    "dalle-2": "dall-e-2",
    "qwen-max": "qwen-max",
    "qwen-plus": "qwen-plus",
    "qwen-turbo": "qwen-turbo",
}

def get_message_str(message: Union[StringPromptValue, BaseMessage, List[BaseMessage]]):
    if isinstance(message, list):
        return "\n".join(list(map(lambda m: m.content, message)))  # type: ignore
    if isinstance(message, BaseMessage):
        return message.content
    return message.text

def sanitize_input(query: str) -> str:
    """Sanitize input to the python REPL.

    Remove whitespace, backtick & python (if llm mistakes python console as terminal)

    Args:
        query: The query to sanitize

    Returns:
        str: The sanitized query
    """

    # Removes `, whitespace & python from start
    query = re.sub(r"^(\s|`)*(?i:python)?\s*", "", query)
    # Removes whitespace & ` from end
    query = re.sub(r"(\s|`)*$", "", query)
    return query

def executor_by_ipython(code: str) -> int:
    """A Python code executor. Use this to execute python commands. Input should be a valid python command.

    Args:
        code: pytho code
    """

    command = sanitize_input(code)
    try:
        data = {
            "application/vnd.libro.interpreter.code+text": code}
        display(data, raw=True)
        exec(command)
    except Exception as e:
        print('Error ocurred while run python code: %s' % (command))
