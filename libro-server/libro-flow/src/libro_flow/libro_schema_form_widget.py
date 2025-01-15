import json
from typing import Any
from ipywidgets import DOMWidget
from traitlets import Unicode, validate
from pydantic import BaseModel
from IPython.display import display

__version__ = "0.1.0"


class SchemaFormWidget(DOMWidget):
    _model_name = Unicode("SchemaFormModel").tag(sync=True)

    _view_name = Unicode("SchemaFormView").tag(sync=True)
    _view_module = Unicode("LibroWidgetView").tag(sync=True)
    _view_module_version = __version__

    value = Unicode("").tag(sync=True)
    schema = Unicode("").tag(sync=True)

    dataModel: BaseModel

    def __init__(self, *args: Any, dataModel: BaseModel, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.schema = json.dumps(dataModel.model_json_schema(), indent=2)
        self.dataModel = dataModel
        self.init_value()
        # self.send_state()

    def init_value(self):
        from IPython.core.getipython import get_ipython

        ipython = get_ipython()
        user_ns = ipython.user_ns  # type: ignore
        vDic = user_ns.get("__libro_execute_args_dict__")
        if vDic is not None:
            self.value = json.dumps(vDic)

    @validate("value")
    def _valid_value(self, proposal):
        value = proposal["value"]
        try:
            from IPython.core.getipython import get_ipython

            ipython = get_ipython()
            user_ns = ipython.user_ns  # type: ignore
            vDict = json.loads(value)
            user_ns["__libro_execute_args_dict__"] = vDict
            for args_key, args_value in self.dataModel.__dict__.items():
                user_ns[args_key] = vDict[args_key]
                self.dataModel.__setattr__(args_key, vDict[args_key])
        except:
            pass
        return value
