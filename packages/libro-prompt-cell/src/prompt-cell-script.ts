export namespace PromptScript {
  export const get_models =
    'import json\nfrom aistudio_notebook.prompt_flow import prompt_model_registry\nmodel_list = list(prompt_model_registry.promptModelRegistry.get_models().keys())\nmodel_data = json.dumps(model_list)\nprint(model_data)\n';
}
