from IPython.core.interactiveshell import InteractiveShell
from .exception import store_exception
from .sql_magic import SQLMagic


def load_ipython_extension(ipython: InteractiveShell):
    ipython.register_magics(SQLMagic)
    ipython.set_custom_exc((BaseException,), store_exception)


def unload_ipython_extension(ipython: InteractiveShell):
    ipython.set_custom_exc((BaseException,), ipython.CustomTB)


def _load_jupyter_server_extension(ipython):
    pass
