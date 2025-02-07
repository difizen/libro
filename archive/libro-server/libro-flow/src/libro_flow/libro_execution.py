import asyncio
import json
from nbclient.util import ensure_async, run_sync
from libro_flow.libro_schema_form_widget import SchemaFormWidget
from numpy import void
from pydantic import BaseModel
from nbformat import NotebookNode
from IPython.display import display
from .libro_client import LibroNotebookClient
from jupyter_client.manager import KernelManager
from typing import Any, Union, Callable, TypeVar

ArgsType = TypeVar("ArgsType", bound=BaseModel)


def inspect_execution_result():
    from IPython.core.getipython import get_ipython

    ipython = get_ipython()
    user_ns = ipython.user_ns  # type: ignore
    try:
        result_dump_path = user_ns["__libro_execute_result_dump_path__"]
        return result_dump_path
    except (TypeError, KeyError):
        pass


def notebook_args(ArgsModel: type[ArgsType]) -> ArgsType:
    from IPython.core.getipython import get_ipython

    ipython = get_ipython()
    args_model = ArgsModel()
    user_ns = ipython.user_ns  # type: ignore

    args_dict = user_ns.get("__libro_execute_args_dict__")
    if args_dict is not None:
        args_model = ArgsModel(**args_dict)

    for args_key, args_value in args_model.__dict__.items():
        user_ns[args_key] = args_value
    user_ns["__libro_execute_args__"] = args_model
    widget = SchemaFormWidget(dataModel=args_model)
    data = {"application/vnd.libro.args+json": args_model.model_json_schema()}
    display(data, raw=True)
    display(widget)
    return args_model


def dump_execution_result(result, path=None):
    import pickle
    from IPython.core.getipython import get_ipython
    import tempfile
    import uuid
    import os

    ipython = get_ipython()
    user_ns = ipython.user_ns  # type: ignore
    result_path = user_ns.get("__libro_execute_result__")
    if result_path is None:
        result_path = path
    if result_path is None:
        result_dir = tempfile.mkdtemp()
        _uuid = uuid.uuid4().hex[:16].lower()
        result_file_name = "libro_execute_result_" + _uuid + ".pickle"
        result_path = os.path.join(result_dir, result_file_name)
        user_ns["__libro_execute_result__"] = result_path
    if not result_path.endswith(".pickle"):
        raise Exception("Output path should endwith .pickle!")
    # 将数据序列化为字节流
    with open(result_path, "wb") as f:
        pickle.dump(result, f)
        user_ns["__libro_execute_result_dump_path__"] = result_path
    return result_path


def load_execution_result(pickle_file_path):
    import pickle

    with open(pickle_file_path, "rb") as f:
        nb_output = pickle.load(f)
    return nb_output


def load_notebook_node(notebook_path):
    import nbformat

    nb = nbformat.read(notebook_path, as_version=4)
    nb_upgraded = nbformat.v4.upgrade(nb)
    if nb_upgraded is not None:
        nb = nb_upgraded
    return nb


def execute_notebook(
    notebook: Any,
    args=None,
    execute_result_path: str | None = None,
    execute_record_path: str | None = None,
    notebook_parser: Callable | None = None,
    km: Union[KernelManager, None] = None,
    **kwargs: Any,
):
    if notebook_parser is not None:
        nb = notebook_parser(notebook)
    else:
        nb = load_notebook_node(notebook)
    client = LibroNotebookClient(
        nb=nb,
        km=km,
        args=args,
        execute_result_path=execute_result_path,
        execute_record_path=execute_record_path,
        **kwargs,
    )
    client.update_execution()
    asyncio.create_task(client.async_execute())
    display(client.execute_result_path)
    return client


def execute_notebook_sync(
    notebook: Any,
    args=None,
    execute_result_path: str | None = None,
    execute_record_path: str | None = None,
    notebook_parser: Callable | None = None,
    km: Union[KernelManager, None] = None,
    **kwargs: Any,
):
    if notebook_parser is not None:
        nb = notebook_parser(notebook)
    else:
        nb = load_notebook_node(notebook)
    client = LibroNotebookClient(
        nb=nb,
        km=km,
        args=args,
        execute_result_path=execute_result_path,
        execute_record_path=execute_record_path,
        **kwargs,
    )
    client.update_execution()
    client.execute()
    display(client.execute_result_path)
    return client
