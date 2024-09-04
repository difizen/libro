# 快速开始

## 本地启动

### 1. 安装

安装 Libro Notebook 的前提是安装了 Python 环境(>3.8)。

使用 pip 安装：

```bash
pip install libro
```

- 注意：

1. 请确保自己的 python 版本大于 3.8.1。

### 2. 运行

在终端中输入命令：`libro`

执行命令之后，终端将会显示一系列 notebook 的服务器信息，同时浏览器将会自动启动 Libro。浏览器地址栏中默认地将会显示：`http://localhost:8888/libro`。其中，“localhost”指的是本机，“8888”则是端口号。

- 注意：

1. 之后在 Libro Notebook 的所有操作，都请保持终端不要关闭，因为一旦关闭终端，就会断开与本地服务器的链接，您将无法在 Libro Notebook 中进行其他操作。

2. 如果您想自定义端口号来启动 Libro，可以在终端中输入以下命令：`libro --port <port_number>`，其中，“<port_number>”是自定义端口号，直接以数字的形式写在命令当中。如：`libro --port 9999`，即在端口号为“9999”的服务器启动 Libro Notebook。
