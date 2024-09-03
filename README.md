# <img src="https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*i_UvSZTIo44AAAAAAAAAAAAADjOxAQ/original" width="30"> libro

[![Code: CI](https://github.com/difizen/libro/actions/workflows/ci.yml/badge.svg)](https://github.com/difizen/libro/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/difizen/libro/graph/badge.svg?token=8LWLNZK78Z)](https://codecov.io/gh/difizen/libro)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

⚡ 灵活定制、轻松集成的 Notebook 产品方案⚡

- 提供完整的 Notebook 能力和丰富的周边功能，基于现有组合快速上手。
- 提供内核级别的扩展能力，所有层次的内容均允许二次开发定制。
- 定义大模型工作流，内置大模型交互和辅助开发能力。

![image](https://mdn.alipayobjects.com/huamei_zabatk/afts/img/A*u40VR6qi_E0AAAAAAAAAAAAADvyTAQ/original)

---

## 目录

- [快速开始](#快速开始)
- [快速集成](#快速集成)
- [架构](#架构)
- [后续计划](#后续计划)
- [更多](#更多)
  - [官网](#贡献代码)
  - [提交issue](#提交issue)
  - [贡献代码](#贡献代码)
  - [贡献者](#贡献者)
  - [联系我们](#联系我们)

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

## 架构

![image](https://mdn.alipayobjects.com/huamei_zabatk/afts/img/A*_3k6SK7AISwAAAAAAAAAAAAADvyTAQ/original)

## 后续计划

- SQL Cell 接入
- Copilot 面板接入
- Libro 在浏览器端执行
- 版本 Diff 接入

## 更多

### 官网

💡 请访问 https://libro.difizen.net/

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

🤗 加入我们的钉钉答疑群与我们联系。

<img src="https://mdn.alipayobjects.com/huamei_zabatk/afts/img/A*oNhKSblcJfIAAAAAAAAAAAAADvyTAQ/original" width="30%">
