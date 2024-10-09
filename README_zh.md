语言: 中文 | [English](./README.md)

<p align="center"><img src="./apps/docs/public/libro-text.svg" width="80" /></p>
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

![image](./apps/docs/public/libro.png)

---

<!-- START doctoc -->
<!-- END doctoc -->

---

## 快速开始

您需要安装 [libro-server](https://github.com/difizen/libro-server) 来体验完整的 libro 能力。

使用 pip:

```bash
pip install libro
```

详情请阅读[快速开始](./apps/docs/docs/quickstart/index.md)。

## 快速集成

libro 是完全模块化的，您可以自由选择 libro 提供的原生能力模块，也可以选择增加自定义模块来完成二次开发，模块化研发方案您可以通过 [mana](https://github.com/difizen/mana) 来了解。

您可以根据自己的需求组装不同的模块，构建自己的 notebook 产品。例如仅因为编辑器相关的模块继承到 IDE 或其他研发环境中，或者引入更多模块来组成 lab 形态的产品。

您至少需要安装 jupyter-server 来支持 libro 运行，此时您可以使用 jupyter notebook 的能力，如果需要使用更多 libro 定义的能力，您需要安装 libro-server。

详情请阅读[快速集成](./apps/docs/docs/integration/index.md)。

### 组件化消费

```typescript
import { ManaComponents } from '@difizen/mana-app';
import { LibroJupyterModule } from "@difizen/libro-jupyter";

<ManaComponents.Application
  modules={[LibroJupyterModule]}
  renderChildren
>
  <LibroComponent options={{ id: 'identify' }} />
</ManaComponents.Application>
```

- Application： mana 上下文容器，建议放在应用的外层，多个 libro 示例可以共享上下文。
- LibroComponent：libro 视图组件，可以将 libro 视图嵌入到任意位置。

## 新特性

### Prompt Cell

- 增强直接与大模型交互的能力，支持文本对话，多模态表达等。
- 增强对于常见输出类型的交互能力，如在输出代码时给出复制、运行等操作能力。

  ![image](./apps/docs/public/prompt_cell_zh.png)

### Sql Cell

- 支持与 sql 的执行交互能力。
- 连接 sql 数据库即可在 notebook 中写 sql 代码。

  ![image](./apps/docs/public/sql_cell.png)

## 架构

![image](./apps/docs/public/technical%20_architecture_zh.png)

## 后续计划

- SQL Cell 接入
- Copilot 面板接入
- Libro 在浏览器端执行
- 版本 Diff 接入

## 更多

### 提交issue

😊 我们建议您使用[github issue](https://github.com/difizen/libro/issues) 提交您的疑问, 我们通常会在2日内回复。

### 贡献代码

🤝 请查阅 [CONTRIBUTING.md](./CONTRIBUTING.md)

### 贡献者

💪 感谢所有的贡献者

<a href="https://github.com/difizen/libro/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=difizen/libro" alt="List of Contributors"/>
</a>

### 联系我们

💬 [加入 Discord](https://discord.gg/RbZ9aEKK)

🤗 [加入钉钉答疑群](https://qr.dingtalk.com/action/joingroup?code=v1,k1,52f1gKWwsZBMrWjXHcQFlOJEQIbbrMO86Iulu3T3ePY=&_dt_no_comment=1&origin=11)

<img src="./apps/docs/public/dingding.jpg" width="30%">
