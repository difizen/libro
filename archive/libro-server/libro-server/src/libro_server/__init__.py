from ._version import __version__

from .app import LibroApp
from .libro_kernel_manager import LibroKernelManager

def _jupyter_server_extension_points():
    """
    Returns a list of dictionaries with metadata describing
    where to find the `_load_jupyter_server_extension` function.
    """
    return [{"module": "libro_server", "app": LibroApp}]
