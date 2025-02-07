# -*- coding: utf-8 -*-

from IPython.core.magic import Magics, magics_class, line_cell_magic

from ..chat import chat_object_manager, chat_record_provider
from langchain.prompts import PromptTemplate
from langchain_core.messages import BaseMessage, AIMessage


def preprocessing_line_prompt(line, local_ns):
    import base64

    try:
        user_input = str(base64.decodebytes(line.encode()), "utf-8")
        import json

        # 将JSON字符串解析成Python对象
        json_obj = json.loads(user_input)
        prompt = json_obj.get("prompt")
        # 替换prompt content变量
        if prompt:
            for key, value in local_ns.items():
                if key and not key.startswith("_"):
                    prompt = prompt.replace("{{" + key + "}}", str(value))
            json_obj["prompt"] = prompt
        return json_obj
    except Exception as e:
        raise Exception("preprocess_prompt error", e)


def preprocessing_cell_prompt(cell, local_ns):
    import base64

    try:
        import json

        # 将JSON字符串解析成Python对象
        json_obj = json.loads(cell)
        prompt = json_obj.get("prompt")
        # 替换prompt content变量
        if prompt:
            for key, value in local_ns.items():
                if key and not key.startswith("_"):
                    prompt = prompt.replace("{{" + key + "}}", str(value))
            json_obj["prompt"] = prompt
        return json_obj
    except Exception as e:
        raise Exception("preprocess_prompt error", e)


class MimeTypeForPrompt(object):
    def __init__(self, smiles=None, val: object = None):
        self.smiles = smiles
        self.data = val

    def _repr_mimebundle_(self, include=None, exclude=None):
        return {
            "application/vnd.libro.prompt+json": self.data,
        }


@magics_class
class PromptMagic(Magics):
    """
    %%prompt
    {"chat_key":"MyGPT","prompt":"do something"}
    """

    LLM_generate_res = ""

    def __init__(self, shell=None):
        super(PromptMagic, self).__init__(shell)

    @line_cell_magic
    def prompt(self, line="", cell=None):
        local_ns = self.shell.user_ns  # type: ignore
        if cell is None:
            (args) = preprocessing_line_prompt(line, local_ns)
        else:
            (args) = preprocessing_cell_prompt(cell, local_ns)

        chat_key: str = args.get("chat_key")
        if chat_key is None or chat_key == "":
            chat_key = args.get("model_name")
        prompt: str = args.get("prompt")
        cell_id: str = args.get("cell_id")

        if (
            (chat_key is None or chat_key == "")
            or (prompt is None or prompt == "")
            or (cell_id is None or cell_id == "")
        ):
            raise Exception("Invalid prompt parameters!")

        record_id: str = args.get("record")
        variable_name: str = args.get("variable_name")
        executor = chat_object_manager.get_executor(chat_key)
        # Use langchain prompt to support prompt templates and other features
        template = PromptTemplate.from_template(prompt)
        formattedPrompt = template.invoke(local_ns)

        res = None
        if cell_id and record_id:
            record = chat_record_provider.get_record(record_id)
            record.append_messages(
                cell_id, formattedPrompt.to_messages(), reset=True
            )
            res = executor.run(record.get_messages())
            if res and isinstance(res, BaseMessage):
                record.append_message(cell_id, res)
            if res and isinstance(res, str):
                record.append_message(cell_id, AIMessage(content=res))
        else:
            res = executor.run(formattedPrompt)
        if res is not None:
            executor.display(res)
        # Set variable
        try:
            if variable_name is None or variable_name == "":
                return
            if not variable_name.isidentifier():
                raise Exception(
                    'Invalid variable name "{}".'.format(variable_name)
                )
            else:
                local_ns[variable_name] = res
        except Exception as e:
            raise Exception("set variable error", e)
