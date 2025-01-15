from ._version import __version__
import jupyter_server.serverapp
from .libro_execution import (
    notebook_args,
    dump_execution_result,
    load_execution_result,
    execute_notebook,
    execute_notebook_sync,
    inspect_execution_result,
)
from .libro_client import LibroNotebookClient
from .execution_handler import LibroExecutionHandler


def _load_jupyter_server_extension(serverapp: jupyter_server.serverapp.ServerApp):
    """
    This function is called when the extension is loaded.
    """
    handlers = [(rf"/{serverapp.name}/api/execution", LibroExecutionHandler)]
    serverapp.web_app.add_handlers(".*$", handlers)
