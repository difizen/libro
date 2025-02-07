from importlib import __import__
from typing import List
import keyword

from .base import is_ipython


def get_variable_list()-> List[str]:
    if not is_ipython():
        return []
    from IPython import get_ipython
    from IPython.core.magics.namespace import NamespaceMagics
    ipython = get_ipython()
    nms = NamespaceMagics()
    nms.shell = ipython.kernel.shell
    values = nms.who_ls()
    return [v for v in values if not keyword.iskeyword(v)]

def get_variable_dict_list(to_dict: lambda v:str or dict or None)-> List[dict]:
    variables = get_variable_list()
    vardic = [
        to_dict(v)
        for v in variables if to_dict(v) is not None
    ]
    return vardic

