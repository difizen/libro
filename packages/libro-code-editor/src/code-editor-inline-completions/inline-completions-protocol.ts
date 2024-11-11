import type * as monaco from '@difizen/monaco-editor-core';

export interface ICompletionContext {
  prefix: string;
  suffix: string;
  fileUrl: string;
  filename: string;
  // workspaceDir: string;
  language: string;
}

/**
 * 补全请求对象
 */
export interface IAICompletionOption {
  sessionId: string;
  /**
   * 模型输入上文
   */
  prompt: string;
  /**
   * 代码下文
   */
  suffix?: string | null;

  workspaceDir?: string;
  /**
   * 文件路径
   */
  fileUrl: string;
  /**
   * 代码语言类型
   */
  language: string;
}

export interface IIntelligentCompletionsResult<T = any> {
  readonly items: monaco.languages.InlineCompletion[];
  /**
   * 定义的额外信息
   */
  extra?: T;
}

export interface IIntelligentCompletionProvider {
  provideInlineCompletionItems: (
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    context: monaco.languages.InlineCompletionContext,
    token: monaco.CancellationToken,
  ) => Promise<IIntelligentCompletionsResult | undefined>;
}

export interface IIntelligentCompletionsRegistry {
  // completionProvider: CompletionProvider;
  registerInlineCompletionsProvider(provider: IIntelligentCompletionProvider): void;
  /**
   * 注册 code edits 功能
   */
  // registerCodeEditsProvider(provider: ICodeEditsProvider): void;
}
