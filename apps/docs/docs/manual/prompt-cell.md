---
title: Prompt Cell Guide
order: 2
---

## What is a Prompt Cell?

A Prompt Cell is a specialized notebook cell that allows users to input natural language instructions to invoke large models for inference and obtain desired output. It minimizes the need to write complex code and integrates flexibly into existing workflows, especially in scenarios requiring frequent AI interactions. Currently, libro’s Prompt Cell:

- Comes with built-in models like ChatGPT, GPT-4, and DALL-E 3. You can also expand your own models by:
  - Defining `llm`, `agent`, and other interactive variables based on LangChain, which can be directly used in a Prompt Cell.
  - Extending your model using libro-ai.
- Supports selecting a chat identifier, allowing all Prompt Cells with the same chat identifier to be within one chat context.
- Allows saving a Prompt Cell as a variable, where the variable represents LangChain's `AIMessage`.

Next, we’ll showcase a practical example that demonstrates how to connect models, generate code, save analysis results, and pass them through conversation history using Prompt Cells combined with Python variables.

## Scenario: Global CO2 Emissions Analysis and Future Prediction

In this example, we’ll use a Prompt Cell to connect a large model for predicting global CO2 emissions over the next 20 years, while also generating Python code for visualization analysis.

### Preparation

1. Configure your model keys and enable the libro-ai extension in `~/.libro/libro_config.yaml`.

```yaml
llm:
  OPENAI_API_KEY: sk-xxx
jpserver_extensions:
  libro_ai: True
```

2. Run the `libro` command in the terminal to start libro.

### Step 1: Analyze CO2 Emission Trends

1. Define Python variables for the time range and dataset URL, ensuring these variables are of string type:

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/prompt_va.png" alt="Variable Definition" width="1000">

2. Use natural language in the Prompt Cell to load the dataset and generate code for visualizing emission trends:
   ① Add a new chat identifier, so that subsequent Prompt Cells with the same identifier are in one chat context.
   ② Save the entire Prompt Cell message as a variable, which represents LangChain's `AIMessage`.

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/co2_trand.png" alt="CO2 Trend Analysis" width="1000">

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/co2_trend_va.png" alt="CO2 Trend Variable" width="1000">

3. Clicking “Insert and Run” will automatically add a Python Cell with model-generated code, and execute it.

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/co2_trend_code.png" alt="CO2 Trend Code" width="1000">

### Step 2: Predict Future CO2 Emissions

1. Use the Prompt Cell to generate code predicting future CO2 emissions. Select the same chat identifier as the previous Prompt Cell and save the variable.

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/co2_predict.png" alt="CO2 Prediction" width="1000">

2. Clicking “Insert and Run” will automatically add a Python Cell with model-generated code, and execute it.

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/co2_predict_code.png" alt="CO2 Prediction Code" width="1000">

### Step 3: Suggest Actions Based on LangChain Messages to Address CO2 Emissions

1. Additionally, you can use LangChain, such as generating actionable recommendations for climate change based on the previously saved `co2_predict` variable.

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/co2_predict_va.png" alt="CO2 Prediction Variable" width="1000">

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/co2_predict_langchain.png" alt="CO2 Prediction with LangChain" width="1000">

2. You’ll also see a new Prompt Cell with model options, including LangChain variable objects like `chat_prompt`, `llm`, and `summary_chain`.

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/langchain_var.png" alt="LangChain Variables" width="1000">
