语言: 中文 | [English](./README.md)

<p align="center"><img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/libro-text.svg" width="120" /></p>
<p align="center"><strong>libro：灵活定制、轻松集成的 Notebook 产品方案</strong></p>

<p align="center">
<a href="https://github.com/difizen/libro/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/difizen/libro/ci.yml?branch=main&style=for-the-badge&logo=github" alt="Code: CI" style="max-width: 100%;"></a>
<a href="/LICENSE"><img src="https://img.shields.io/github/license/difizen/libro?style=for-the-badge" alt="MIT License"></a>
<a href="https://www.npmjs.com/package/@difizen/libro-core"><img alt="NPM Downloads" src="https://img.shields.io/npm/dm/@difizen/libro-core?logo=npm&style=for-the-badge"></a>
<a href="https://github.com/difizen/libro/pulls"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge"></a>
<a href="https://libro.difizen.net"><img alt="website" src="https://img.shields.io/static/v1?label=&labelColor=505050&message=Homepage&color=0076D6&style=for-the-badge&logo=google-chrome&logoColor=f5f5f5"></a>
</p>

## 特性

- 提供完整的 Notebook 能力和丰富的周边功能，基于现有组合快速上手。
- 提供内核级别的扩展能力，所有层次的内容均允许二次开发定制。
- 定义大模型工作流，内置大模型交互和辅助开发能力。

<p>　</p>
<p align="center">
🌟🌟🌟 如果您也喜欢这个项目，欢迎为我们点亮 🌟🌟🌟
</p>
<p>　</p>

![image](https://raw.githubusercontent.com/wiki/difizen/libro/assets/libro.png)

---

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## 目录

- [快速开始](#%E5%BF%AB%E9%80%9F%E5%BC%80%E5%A7%8B)
- [新特性](#%E6%96%B0%E7%89%B9%E6%80%A7)
  - [AI 能力](#ai-%E8%83%BD%E5%8A%9B)
  - [Prompt Cell](#prompt-cell)
  - [Sql Cell](#sql-cell)
- [架构](#%E6%9E%B6%E6%9E%84)
- [后续计划](#%E5%90%8E%E7%BB%AD%E8%AE%A1%E5%88%92)
- [更多](#%E6%9B%B4%E5%A4%9A)
  - [提交issue](#%E6%8F%90%E4%BA%A4issue)
  - [贡献代码](#%E8%B4%A1%E7%8C%AE%E4%BB%A3%E7%A0%81)
  - [贡献者](#%E8%B4%A1%E7%8C%AE%E8%80%85)
  - [联系我们](#%E8%81%94%E7%B3%BB%E6%88%91%E4%BB%AC)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

---

## 快速开始

```bash
pip install libro
```

> [!NOTE]
> 使用的 Python 版本为 3.10-3.12，过高的 Python 版本可能存在依赖包不支持的问题。

详情请阅读[快速开始](./apps/docs/docs/quickstart/index.md)。


## 新特性

### AI 能力

- 错误修复

![image](https://raw.githubusercontent.com/wiki/difizen/libro/assets/error_debug_zh.gif)

- AI 对话
  - 基于 Cell 上下文对话

![image](https://raw.githubusercontent.com/wiki/difizen/libro/assets/cell_chat_zh.gif)

  - 通用对话

![image](https://raw.githubusercontent.com/wiki/difizen/libro/assets/ai_chat_zh.gif)

- 代码解释

![image](https://raw.githubusercontent.com/wiki/difizen/libro/assets/cell_explain_zh.gif)

- 代码优化

![image](https://raw.githubusercontent.com/wiki/difizen/libro/assets/cell_opitimization_zh.gif)

### Prompt Cell

- 增强直接与大模型交互的能力，支持文本对话，多模态表达等。
- 增强对于常见输出类型的交互能力，如在输出代码时给出复制、运行等操作能力。
- 内置了 OpenAI 系列模型，您还可以通过以下方式扩展模型～
  - 基于 langchain 定义 llm、agent 等可对话对象的变量，他们可以直接用在 Prompt cell 中。
  - 基于 libro-ai 扩展自己的模型。
- 支持选择聊天标识，使得选择该聊天标识的 Prompt Cell 都在一个聊天上下文中。
- 支持 Prompt Cell 保存为一个变量，该变量即为 langchain 的 AIMessage。

详情请阅读[prompt cell 指南](./apps/docs/docs/manual/prompt-cell.md)。

![image](https://raw.githubusercontent.com/wiki/difizen/libro/assets/prompt_cell_zh.gif)

### Sql Cell

- 支持与 sql 的执行交互能力。
- 连接 sql 数据库即可在 notebook 中写 sql 代码。

详情请阅读[sql cell 指南](./apps/docs/docs/manual/sql-cell.md)。

![image](https://raw.githubusercontent.com/wiki/difizen/libro/assets/sql_cell_zh.gif)

## 架构

![image](https://raw.githubusercontent.com/wiki/difizen/libro/assets/technical_architecture_zh.png)

## 后续计划

- AI 特性接入
- Libro 在浏览器端执行
- 版本 Diff 接入

## 更多

### 提交issue

😊 我们建议您使用[github issue](https://github.com/difizen/libro/issues) 提交您的疑问, 我们通常会在2日内回复。

### 贡献代码

🤝 请查阅 [CONTRIBUTING.md](./CONTRIBUTING_zh.md)

### 贡献者

💪 感谢所有的贡献者

<a href="https://github.com/difizen/libro/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=difizen/libro" alt="List of Contributors"/>
</a>

### 联系我们

💬 [加入 Discord](https://discord.com/invite/B4V7AWy4)

🤗 [加入钉钉答疑群](https://qr.dingtalk.com/action/joingroup?code=v1,k1,52f1gKWwsZBMrWjXHcQFlOJEQIbbrMO86Iulu3T3ePY=&_dt_no_comment=1&origin=11)

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/dingding.jpg" width="30%">
