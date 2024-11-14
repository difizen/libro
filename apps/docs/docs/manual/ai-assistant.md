---
title: AI Programming Assistant Guide
order: 3
---

## Preparation

Configure large model settings in `~/.libro/libro_config.yaml`.

Currently supported models include:

- OpenAI models: `gpt-4`, `gpt-3.5-turbo`, `text-davinci-003`
- Qwen-related models: `qwen-max`, `qwen-plus`, `qwen-turbo`

Set the default model and keys:

```yaml
llm:
  DASHSCOPE_API_KEY: xxx # Key for Qwen-related models
  OPENAI_API_KEY: xxx # Key for OpenAI models
  default_model: qwen-max
```

> 💡 **Tip**: If using Qwen as the default model, install the dependencies with `pip install dashscope --upgrade`.

## Error Fixing

When a cell execution error occurs, click the "Fix with AI" button. The assistant will automatically analyze the error and provide fix suggestions. Click the "Cancel" button to exit error-fix mode.

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/error_debug.gif" alt="Error Debug GIF" width="1000">

## AI Chat

### Contextual Cell Chat

Accessed via the chat button in the cell's right toolbar, you can interact with the AI directly, obtaining in-depth explanations and optimization advice related to the current code, improving coding efficiency.

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/cell_chat.gif" alt="Cell Chat GIF" width="1000">

### General Chat

Accessed from the top right toolbar, allowing for open-ended conversations with the AI to ask programming-related questions, get advice, and enjoy intelligent interaction.

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/ai_chat.gif" alt="AI Chat GIF" width="1000">

### Code Explanation

Summonable from the magic icon in the cell’s right toolbar to help you understand the function and logic of the code within the cell.

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/ai_chat.gif" alt="Code Explanation GIF" width="1000">

### Code Optimization

Activated from the magic icon in the cell's right toolbar, it analyzes the code in the cell and provides optimization suggestions.

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/cell_opitimization.gif" alt="Cell Optimization GIF" width="1000">
```
