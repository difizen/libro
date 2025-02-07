## 开发

本项目包含 lab 目录下的 libro-lab 前端工程和 libro-server、libro-ai 两个 python 包，分别在 libro-server 和 libro-ai 目录下。

### 基础环境

我们使用 rye 来管理多 python 包组成 monorepo，多个包会共享同一个虚拟环境 venv

- 请先自行安装 `rye` `npm`

```shell
rye sync # 安装依赖
```

### lab

```shell
cd lab
npm install # 依赖安装
npm run dev # 启动开发
npm run build # 构建
npm run deploy # 构建产物复制到 libro-server
```

### libro-server

```shell
cd libro-server
npm i # 安装非 python 依赖
rye run dev # 启动服务器
rye build # 打包
rye publish # 发布到 pypi
```

### libro-ai

```shell
cd libro-ai
rye build
rye publish
```

### libro-flow

```shell
cd libro-flow
rye build
rye publish
```
