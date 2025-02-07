from .magics import PromptMagic, store_exception
from IPython.core.interactiveshell import InteractiveShell


def load_ipython_extension(ipython: InteractiveShell):
    ipython.register_magics(PromptMagic)
    ipython.set_custom_exc((BaseException,), store_exception)


def unload_ipython_extension(ipython: InteractiveShell):
    ipython.set_custom_exc((BaseException,), ipython.CustomTB)


def _load_jupyter_server_extension(app):
    pass
