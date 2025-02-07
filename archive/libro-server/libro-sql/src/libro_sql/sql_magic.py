# -*- coding: utf-8 -*-

import base64
import json
from IPython.core.magic import Magics, magics_class, line_cell_magic
from .database import db


def is_ipython() -> bool:
    """
    Check if interface is launching from iPython
    :return is_ipython (bool): True or False
    """
    is_ipython = False
    try:  # Check if running interactively using ipython.
        from IPython import get_ipython

        if get_ipython() is not None:
            is_ipython = True
    except (ImportError, NameError):
        pass
    return is_ipython


def preprocessing_line(line, local_ns):
    try:
        user_input = str(base64.decodebytes(line.encode()), "utf-8")
        # 将JSON字符串解析成Python对象
        json_obj = json.loads(user_input)
        content = json_obj.get("sql_script")
        # 替换变量
        if content:
            for key, value in local_ns.items():
                if key and not key.startswith("_"):
                    content = content.replace("{{" + key + "}}", str(value))
            json_obj["sql_script"] = content
        return json_obj
    except Exception as e:
        raise Exception("preprocess error", e)


def preprocessing_cell(cell, local_ns):
    try:
        # 将JSON字符串解析成Python对象
        json_obj = json.loads(cell)
        content = json_obj.get("sql_script")
        # 替换变量
        if content:
            for key, value in local_ns.items():
                if key and not key.startswith("_"):
                    content = content.replace("{{" + key + "}}", str(value))
            json_obj["sql_script"] = content
        return json_obj
    except Exception as e:
        raise Exception("preprocess error", e)


@magics_class
class SQLMagic(Magics):
    """
    %%prompt
    {"result_variable":"custom_variable_name","sql_script":"SELECT 1","db_id":"xxxx"}
    """

    def __init__(self, shell=None):
        super(SQLMagic, self).__init__(shell)

    @line_cell_magic
    def sql(self, line="", cell=None):
        local_ns = self.shell.user_ns  # type: ignore
        if cell is None:
            args = preprocessing_line(line, local_ns)
        else:
            args = preprocessing_cell(cell, local_ns)

        result_variable: str = args.get("result_variable")
        sql_script: str = args.get("sql_script")
        db_id: str = args.get("db_id")

        if sql_script is None or sql_script == "":
            raise Exception("Invalid sql script!")
        if db_id is None or db_id == "":
            raise Exception("Invalid db id!")

        res = db.execute(sql_script,db_id)

        # Set variable
        try:
            if result_variable is None or result_variable == "":
                return
            if not result_variable.isidentifier():
                raise Exception(
                    'Invalid variable name "{}".'.format(result_variable)
                )
            else:
                local_ns[result_variable] = res
        except Exception as e:
            raise Exception("set variable error", e)

        if is_ipython():
            from IPython.display import display
            display(res)
