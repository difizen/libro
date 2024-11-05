---
title: Integrating LSP with the Editor
order: 10
---

# Integrating LSP with the Editor

Libro can run in various environments, and when deploying in Libro-server mode, the code editor requires some configuration to integrate with LSP to support advanced features (such as code completion, suggestions, validation, formatting, etc.).

## Basic Architecture of the Editor

![editor demo](./image-1.png)

Libro provides an abstraction called [IEditor](https://github.com/difizen/libro/blob/ea46403edaa99488a59b0f94554c22b7115b3d6f/packages/libro-code-editor/src/code-editor-protocol.ts#L207) at the editor level to offer code editing capabilities. Scenarios such as code editing (Python, Markdown, SQL, etc.) and global search rely on the `IEditor` interface. There are several implementations of IEditor, including CodeMirror 6 and Cofine Editor. The Cofine Editor is based on the Monaco Editor and supports a rich set of language service interfaces (such as code suggestions, code navigation, formatting, etc.). We provide the [LibroLanguageClient](https://github.com/difizen/libro/blob/ea46403edaa99488a59b0f94554c22b7115b3d6f/packages/libro-language-client/src/libro-language-client.ts#L29) to interface with the LSP server and retrieve language service information. The LSP server runs as an independent process on the server side and is managed by Jupyter-LSP.

![alt text](./image.png)

## LSP Server Configuration

The LSP server needs to support the capabilities of the Notebook section of the LSP protocol to function properly with Libro. Currently supported servers include Ruff and Pylez (previously known as libro-analyzer).

The Ruff LSP server runs in a Python environment and is included with the libro-server. Pylez runs in a Node.js environment and requires the server to have npm and Node.js installed. Use `npm install @difizen/libro-analyzer` to install the dependency and provide the following configuration in the Libro-server configuration file:

```python
c.LanguageServerManager.language_servers = {
    "ruff-lsp": {
        # if installed as a binary
        "argv": [
            "ruff-lsp",
        ],
        "languages": ["python"],
        "version": 2,
        "mime_types": ["text/x-python"],
        "display_name": "ruff-lsp",
    },
    "libro-analyzer": {
        # if installed as a binary
        "argv": [
            "node",
            "node_modules/@difizen/libro-analyzer/index.js", # Provide the actual installation path of Libro-analyzer
            "--stdio",
        ],
        "languages": ["python"],
        "version": 2,
        "mime_types": ["text/x-python"],
        "display_name": "libro-analyzer",
    },
}
```
