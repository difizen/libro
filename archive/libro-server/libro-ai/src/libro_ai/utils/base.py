from importlib import __import__

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

def attempt_import(module):
    try:
        return __import__(module)
    except ImportError:
        return None
    
