import { Syringe } from '@difizen/mana-app';

import type { IPosition, IRange } from '../code-editor-protocol.js';

export interface IRelativePattern {
  /**
   * A base file path to which this pattern will be matched against relatively.
   */
  readonly base: string;
  /**
   * A file glob pattern like `*.{ts,js}` that will be matched on file paths
   * relative to the base path.
   *
   * Example: Given a base of `/home/work/folder` and a file path of `/home/work/folder/index.js`,
   * the file glob pattern will match on `index.js`.
   */
  readonly pattern: string;
}

export interface LanguageFilter {
  readonly language?: string;
  readonly scheme?: string;
  readonly pattern?: string | IRelativePattern;
  readonly notebookType?: string;
  /**
   * This provider is implemented in the UI thread.
   */
  readonly hasAccessToAllModels?: boolean;
  readonly exclusive?: boolean;
  /**
   * This provider comes from a builtin extension.
   */
  readonly isBuiltin?: boolean;
}

export type LanguageSelector =
  | string
  | LanguageFilter
  | ReadonlyArray<string | LanguageFilter>;

export interface ICompletionContext {
  prefix: string;
  suffix: string;
  fileUrl: string;
  filename: string;
  // workspaceDir: string;
  language: string;
  position?: IPosition;
  extra?: Record<string, any>;
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

export interface InlineCompletion {
  /**
   * The text to insert.
   * If the text contains a line break, the range must end at the end of a line.
   * If existing text should be replaced, the existing text must be a prefix of the text to insert.
   *
   * The text can also be a snippet. In that case, a preview with default parameters is shown.
   * When accepting the suggestion, the full snippet is inserted.
   */
  readonly insertText:
    | string
    | {
        snippet: string;
      };
  /**
   * A text that is used to decide if this inline completion should be shown.
   * An inline completion is shown if the text to replace is a subword of the filter text.
   */
  readonly filterText?: string;
  /**
   * An optional array of additional text edits that are applied when
   * selecting this completion. Edits must not overlap with the main edit
   * nor with themselves.
   */
  // readonly additionalTextEdits?: editor.ISingleEditOperation[];
  /**
   * The range to replace.
   * Must begin and end on the same line.
   */
  readonly range?: IRange;
  // readonly command?: Command;
  /**
   * If set to `true`, unopened closing brackets are removed and unclosed opening brackets are closed.
   * Defaults to `false`.
   */
  readonly completeBracketPairs?: boolean;
}

export interface IIntelligentCompletionsResult<T = any> {
  readonly items: InlineCompletion[];
  /**
   * 定义的额外信息
   */
  extra?: T;
}

export const InlineCompletionContribution = Syringe.defineToken(
  'InlineCompletionContribution',
);

export interface InlineCompletionRegistry {
  addCompletion: (obj: InlineCompletionImplement) => void;
}

export interface InlineCompletionContribution {
  canHandle: () => number;
  registerCompletion: (register: InlineCompletionRegistry) => void;
}

export interface InlineCompletionProvider {
  provideInlineCompletionItems: ProvideInlineCompletionsFunction;
}

export interface CancellationToken {
  /**
   * A flag signalling is cancellation has been requested.
   */
  readonly isCancellationRequested: boolean;
  /**
   * An event which fires when cancellation is requested. This event
   * only ever fires `once` as cancellation can only happen once. Listeners
   * that are registered after cancellation will be called (next event loop run),
   * but also only once.
   *
   * @event
   */
  readonly onCancellationRequested: (
    listener: (e: any) => any,
    thisArgs?: any,
    disposables?: IDisposable[],
  ) => IDisposable;
}

export interface IDisposable {
  dispose(): void;
}

export interface InlineCompletionImplement {
  selector: LanguageSelector;
  getInlineCompletions: ProvideInlineCompletionsFunction;
  freeInlineCompletions: any;
}

export type ProvideInlineCompletionsFunction = (
  context: ICompletionContext,
  token: CancellationToken,
) => Promise<IIntelligentCompletionsResult | undefined>;
