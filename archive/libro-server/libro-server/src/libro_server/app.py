import os
from glob import glob
from traitlets import Unicode
from jupyterlab_server import LabServerApp, add_handlers
from jupyter_server.utils import url_path_join as ujoin
from os.path import relpath
from .static_handler import LibroLabHandler
from .workspace_handler import LibroWorkspaceHandler

DEFAULT_STATIC_FILES_PATH = os.path.join(os.path.dirname(__file__), "static")
DEFAULT_TEMPLATE_FILES_PATH = os.path.join(os.path.dirname(__file__), "templates")


class LibroApp(LabServerApp):

    # -------------- Required traits --------------
    name = "libro"
    default_url = Unicode("/libro", help="The default URL to redirect to from `/`")
    extension_url = "/libro"
    load_other_extensions = True
    file_url_prefix = "/libro-render"

    # Should your extension expose other server extensions when launched directly?
    load_other_extensions = True
    # Local path to static files directory.
    static_paths = [DEFAULT_STATIC_FILES_PATH]

    # Local path to templates directory.
    template_paths = [DEFAULT_TEMPLATE_FILES_PATH]

    def initialize(self, *args, **kwargs):
        super().initialize(*args, **kwargs)
        #自动注册自身为 Jupyter Server 扩展
        self.serverapp.jpserver_extensions[self.name] = True

    @property
    def config_file_paths(self):
        """Look on the same path as our parent for config files"""
        # rely on parent serverapp, which should control all config loading
        paths = super().config_file_paths
        # add a low priority config
        paths.insert(0, os.path.dirname(os.path.abspath(__file__)))
        return paths
        
    # ----------- add custom traits below ---------

    def initialize_settings(self) -> None:
        """Initialize the settings:

        set the static files as immutable, since they should have all hashed name.
        """
        immutable_cache = set(self.settings.get("static_immutable_cache", []))

        # Set lab static files as immutables
        immutable_cache.add(self.static_url_prefix)

        # Set extensions static files as immutables
        for extension_path in self.labextensions_path + self.extra_labextensions_path:
            extensions_url = [
                ujoin(self.labextensions_url, relpath(path, extension_path))
                for path in glob(f"{extension_path}/**/static", recursive=True)
            ]

            immutable_cache.update(extensions_url)

        self.settings.update({"static_immutable_cache": list(immutable_cache)})

    def initialize_templates(self) -> None:
        """Initialize templates."""
        # self.static_paths = [self.static_dir]
        # self.template_paths = [os.path.join(os.path.dirname(__file__), "templates")]

    def initialize_handlers(self) -> None:
        """Initialize handlers."""
        # LIBRO_URL_PATTERN = (r"/(?P<libro>/libro/.*)?")
        # url_pattern = LIBRO_URL_PATTERN.format(self.app_url.replace("/", ""))
        super().initialize_handlers()
        self.handlers.extend(
            [
                (rf"/{self.name}/api/workspace", LibroWorkspaceHandler),
                (rf"/{self.name}/execution", LibroLabHandler),
                (rf"/{self.name}/interaction", LibroLabHandler),
                (rf"/dbgpt", LibroLabHandler),
                (rf"/{self.name}/?", LibroLabHandler),
            ]
        )
        try:
            from .libro_ai_handler import LibroChatHandler, LibroChatStreamHandler 
            self.handlers.extend(
                [   (rf"/libro/api/chat", LibroChatHandler),
                    (rf"/libro/api/chatstream", LibroChatStreamHandler)
                ]
            )
        except ImportError:
            print('ImportError for libro-ai')
        add_handlers(self.handlers, self)
