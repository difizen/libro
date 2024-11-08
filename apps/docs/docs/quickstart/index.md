---
nav:
  title: QuickStart

title: QuickStart
order: 2
---

# Quick Start

## Local Launch

### 1. Installation

Before installing Libro Notebook, ensure you have a Python environment (>3.8) installed.

Install using pip:

```bash
pip install libro
```

- Note:

1. Please ensure your Python version is greater than 3.8.1.

### 2. Run

Enter the command in the terminal: `libro`

After executing the command, the terminal will display a series of notebook server information, and the browser will automatically launch Libro. The browser's address bar will default to: `http://localhost:8888/libro`. Here, "localhost" refers to your own machine, and "8888" is the port number.

- Note:

1. Keep the terminal open for all operations in Libro Notebook, as closing the terminal will disconnect the link to the local server, and you will not be able to perform other operations in Libro Notebook.

2. If you want to customize the port number to launch Libro, you can enter the following command in the terminal: `libro --port=<port_number>`, where "<port_number>" is your custom port number, written directly as a number in the command. For example: `libro --port=9999` to launch Libro Notebook on the server with port number "9999".
