import json
from jupyter_server.base.handlers import JupyterHandler, APIHandler
from tornado import web


class LibroWorkspaceHandler(APIHandler):
    # @web.authenticated
    async def get(self) -> None:
        page_config = self.settings.get("page_config_data")
        self.set_header("Content-Type", "application/json")
        self.finish(json.dumps(page_config))
