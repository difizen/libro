import json
import os
import re
from typing import cast
from jupyter_server.base.handlers import JupyterHandler, APIHandler
from jupyter_server.extension.handler import (
    ExtensionHandlerMixin,
    ExtensionHandlerJinjaMixin,
)
from jupyterlab_server import LabHandler
from tornado import template, web


class BaseTemplateHandler(ExtensionHandlerJinjaMixin, ExtensionHandlerMixin, JupyterHandler):  # type: ignore
    """The base template handler."""

    pass


class TemplateHandler(BaseTemplateHandler):
    """A template handler."""

    def get(self):
        """Optionally, you can print(self.get_template('simple1.html'))"""
        self.write(self.render_template("libro.html"))


class ErrorHandler(BaseTemplateHandler):
    """An error handler."""

    def get(self, path):
        """Write_error renders template from error.html file."""
        self.write_error(400)


class LibroLabHandler(LabHandler):
    """Render the JupyterLab View."""

    @property
    def static_js_entry(self) -> str:
        # Get the current file's directory
        current_directory = os.path.dirname(os.path.abspath(__file__))
        # Define the path to the 'static' directory
        static_directory = os.path.join(current_directory, 'static')

        # Define the regex pattern for matching filenames
        pattern = re.compile(r'^umi\.[a-f0-9]{8}\.js$')

        # List to store matching filenames
        matching_files = []

        # Check if the static directory exists
        if os.path.exists(static_directory) and os.path.isdir(static_directory):
            # Iterate over files in the static directory
            for filename in os.listdir(static_directory):
                # Match the file pattern
                if pattern.match(filename):
                    return self.static_url(filename, include_version=False)

        return self.static_url('umi.js')

    @web.authenticated
    @web.removeslash
    def get(self, mode=None, workspace=None, tree=None) -> None:
        """Get the JupyterLab html page."""
        workspace = (
            "default" if workspace is None else workspace.replace(
                "/workspaces/", "")
        )
        tree_path = "" if tree is None else tree.replace("/tree/", "")

        page_config = self.get_page_config()

        # Add parameters parsed from the URL
        if mode == "doc":
            page_config["mode"] = "single-document"
        else:
            page_config["mode"] = "multiple-document"

        page_config["workspace"] = workspace
        page_config["treePath"] = tree_path
        page_config['static_js_entry'] = self.static_js_entry

        # Write the template with the config.
        tpl = self.render_template(
            "libro.html", page_config=page_config
        )  # type:ignore[no-untyped-call]
        self.write(tpl)
