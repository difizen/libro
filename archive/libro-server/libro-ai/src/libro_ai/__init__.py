from ._version import __version__

from .extensions import (
    load_ipython_extension,
    unload_ipython_extension,
    _load_jupyter_server_extension,
)


from .chat import (
    chat_object_manager,
    ChatObjectProvider,
    ChatExecutor,
    ChatObject,
    ChatObjectProvider,
    chat_record_provider,
)

from .utils import (
    is_ipython,
    is_langchain_installed,
    get_variable_list,
    get_variable_dict_list,
    get_langchain_variable_dict_list,
)
