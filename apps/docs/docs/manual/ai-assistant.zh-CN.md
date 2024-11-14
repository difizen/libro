---
title: AI 编程助手指南
order: 3
---

## 准备工作

在 `~/.libro/libro_config.yaml` 配置大模型相关配置

其中，目前支持的模型有：

- OpenAI 相关：`gpt-4`、`gpt-3.5-turbo`、`text-davinci-003`
- 通义千问相关：`qwen-max`、`qwen-plus`、`qwen-turbo`

配置默认的模型和 Key：

```yaml
llm:
  DASHSCOPE_API_KEY: xxx # Qwen 相关的模型 key
  OPENAI_API_KEY: xxx # OpenAI 相关的模型 key
  default_model: qwen-max
```

> <span style="font-style: normal;">💡 **Tip**: 如果使用通义千问作为默认模型，请使用`pip install dashscope --upgrade`安装依赖.
> </span>

## 报错修复

当 Cell 执行出现报错时，点击 “Fix with AI” 按钮，助手会自动分析错误并给出修复建议，点击“取消”按钮退出报错修复模式。

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/error_debug_zh.gif" alt="alt text" width="1000" >

## AI 对话

### Cell 上下文对话

从 Cell 右侧工具栏对话按钮唤起，你可以直接与 AI 进行互动，获得与当前代码相关的深入解答和优化建议，提升编程效率。

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/cell_chat_zh.gif" alt="alt text" width="1000" >

### 通用对话

从顶部右侧工具栏唤起，你可以与 AI 进行开放式对话，询问编程相关问题，获取建议和信息，享受智能互动的乐趣。

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/ai_chat_zh.gif" alt="alt text" width="1000" >

### 代码解释

从 Cell 右侧工具栏的魔法符号唤起，帮助理解 Cell 中代码的功能和逻辑。
<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/ai_chat_zh.gif" alt="alt text" width="1000" >

### 代码优化

从 Cell 右侧工具栏的魔法符号唤起，分析单元格（cell）中的代码，并提供优化建议。
<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/cell_opitimization_zh.gif" alt="alt text" width="1000" >
