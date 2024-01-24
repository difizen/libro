# <img src="https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*i_UvSZTIo44AAAAAAAAAAAAADjOxAQ/original" width="30"> libro

[![Code: CI](https://github.com/difizen/libro/actions/workflows/ci.yml/badge.svg)](https://github.com/difizen/libro/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/difizen/libro/graph/badge.svg?token=8LWLNZK78Z)](https://codecov.io/gh/difizen/libro)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

⚡ 大模型时代的 notebook 产品方案⚡

- 定义大模型工作流，内置大模型交互和辅助开发能力。
- 更优雅的交互体验，兼容 jupyter notebook。
- 方便集成和扩展，全面模块化设计。

## 如何使用

您需要安装 [libro-server](https://github.com/difizen/libro-server) 来体验完整的 libro 能力。

### Prompt cell

您可以在自己的工作流中使用 [prompt cell](./packages/libro-prompt-cell/README.md)，快速完成与大模型的交互，生成的结果也可以在上下文中继续访问。

![image](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*x0SxT5lDETYAAAAAAAAAAAAADjOxAQ/original)

### lab 研发环境

![image](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*6eDdTovoKwsAAAAAAAAAAAAADjOxAQ/original)

## 如何集成

libro 是完全模块化的，您可以自由选择 libro 提供的原生能力模块，也可以选择增加自定义模块来完成二次开发，模块化研发方案您可以通过 [mana](https://github.com/difizen/mana) 来了解。

您可以根据自己的需求组装不同的模块，构建自己的 notebook 产品。例如仅因为编辑器相关的模块继承到 IDE 或其他研发环境中，或者引入更多模块来组成 lab 形态的产品。

您至少需要安装 jupyter-server 来支持 libro 运行，此时您可以使用 jupyter notebook 的能力，如果需要使用更多 libro 定义的能力，您需要安装 libro-server。

### 编辑器

![image](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*jfLFTqY-l6EAAAAAAAAAAAAADjOxAQ/original)

### 模块

通常用户只需要引入 `libro-jupyter` 模块即可，该模块包含了 notebook 常用的模块。用户可以通过增加自定义模块来完成个性化定制需求。

非 jupyter 场景用户可以选择在 `libro-core` 模块的基础上，有选择的引入其他模块，以满足自己的需求定制。

- [内核](./packages/libro-core/README.md)：定义基础交互，提供可扩展单元格和输出规范。
- [kernel](./packages/libro-kernel/README.md)：提供面向 jupyter 服务的 API，提供 session 和 kernel 通信封装。
- [prompt cell](./packages/libro-prompt-cell/README.md)：大模型对话能力。
- [markdown cell](./packages/libro-codemirror-markdown-cell/README.md)：基于 codemirror 的 markdown 单元格。
- [code cell](./packages/libro-codemirror-code-cell/README.md)：基于 codemirror 的 code 单元格。
- [raw cell](./packages/libro-codemirror-raw-cell/README.md)：基于 codemirror 的 raw 单元格。
- [输出](./packages/libro-output/README.md)：内置支持多种输出类型。
- [mime 渲染](./packages/libro-rendermime/README.md)：提供多种 mime 渲染器，支持自定义渲染器。
- [大纲](./packages/libro-toc/README.md)：提供基于 markdown 和输出区的大纲能力。
- [全文搜索](./packages/libro-search/README.md)：提供对单元格编辑区域和输出区域的全文搜索能力，支持自定义提供搜索能力。
- [本地化](./packages/libro-l10n/README.md)：提供多语言支持。
- [jupyter](./packages/libro-jupyter/README.md)：面向 jupyter 服务的预设模块。

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

![image](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*ca1tTapQbBYAAAAAAAAAAAAADjOxAQ/original)

## 贡献代码

请查阅 [CONTRIBUTING.md](./CONTRIBUTING.md)
