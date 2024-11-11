import type {
  IAICompletionOption,
  ICompletionContext,
  IIntelligentCompletionsResult,
} from '@difizen/libro-code-editor';
import { transient } from '@difizen/mana-app';
import * as monaco from '@difizen/monaco-editor-core';
import { v4 } from 'uuid';

import { generateInstructionsPrompt } from './Prompt/instruction.js';

@transient()
export class CompletionRequest {
  isCancelFlag: boolean;
  id: string;

  constructor(
    public model: monaco.editor.ITextModel,
    public position: monaco.Position,
    public token: monaco.CancellationToken,
  ) {
    this.isCancelFlag = false;
    this.id = v4();
  }

  // 拼接上下文信息
  protected constructRequestContext(
    context: ICompletionContext,
    token: monaco.CancellationToken,
  ): IAICompletionOption {
    // const prompt = lineBasedPromptProcessor.processPrefix(context.prefix);
    // const suffix = lineBasedPromptProcessor.processSuffix(context.suffix);
    const prompt = context.prefix;
    const suffix = context.suffix;

    return {
      prompt,
      suffix,
      sessionId: v4(),
      language: context.language,
      fileUrl: context.fileUrl,
      // workspaceDir: context.workspaceDir,
    };
  }

  cancelRequest() {
    this.isCancelFlag = true;
  }

  // 向大模型发送请求
  async run() {
    const { model, position, token } = this;
    if (!this.model || this.isCancelFlag || token.isCancellationRequested) {
      return [];
    }

    const startRange = new monaco.Range(0, 0, position.lineNumber, position.column);
    let prefix = model.getValueInRange(startRange);
    if (prefix === '') {
      prefix += '\n';
    }
    const endRange = new monaco.Range(
      position.lineNumber,
      position.column,
      model.getLineCount(),
      Number.MAX_SAFE_INTEGER,
    );

    const suffix = model.getValueInRange(endRange);

    const languageId = model.getLanguageId();
    const context: ICompletionContext = {
      fileUrl: model.uri.fsPath,
      filename: model.uri.toString().split('/').pop() || '',
      language: languageId,
      prefix,
      suffix,
    };

    let completeResult: IIntelligentCompletionsResult | undefined;
    const requestBean = await this.constructRequestContext(context, token);
    try {
      completeResult = await this.complete(requestBean);
    } catch (e) {
      console.error('Inline Completion Request Error:', e);
      return [];
    }
    // 结果format 及其推送，先直接返回

    return [...(completeResult?.items || [])];
  }

  protected async complete(
    data: IAICompletionOption,
  ): Promise<IIntelligentCompletionsResult | undefined> {
    // 调用大模型非流式接口
    const url = `/libro/api/chat`;

    const instruction = generateInstructionsPrompt(
      data.language,
      data.prompt,
      data.suffix,
    );

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: instruction }),
    });

    try {
      const responseData = await res.json();

      return {
        items: [{ insertText: responseData.res }], // Expecting the result to be in this structure
      };
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return undefined; // Or handle the error appropriately
    }
  }
}
