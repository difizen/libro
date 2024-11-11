import type { IIntelligentCompletionProvider } from '@difizen/libro-code-editor';
import { singleton } from '@difizen/mana-app';
import type * as monaco from '@difizen/monaco-editor-core';

import { CompletionRequest } from './inline-completion-request.js';
import { raceCancellation, sleep } from './utils.js';

// 缓存最近一次的补全结果
const inlineCompletionCache: {
  line: number;
  column: number;
  last: { items: monaco.languages.InlineCompletion[] } | null;
} = {
  line: -1,
  column: -1,
  last: null,
};

class ReqStack {
  queue: CompletionRequest[];
  constructor() {
    this.queue = [];
  }
  addReq(reqRequest: CompletionRequest) {
    this.queue.push(reqRequest);
  }
  runReq() {
    if (this.queue.length === 0) {
      return;
    }
    const fn = this.queue.pop();
    if (!fn) {
      return;
    }

    return fn.run();
  }
  cancelReq() {
    if (this.queue.length === 0) {
      return;
    }
    this.queue.forEach((item) => {
      item.cancelRequest();
    });
    this.queue = [];
  }
}

@singleton()
export class AICompletionProvider implements IIntelligentCompletionProvider {
  reqStack: ReqStack;
  inlineComletionsDebounceTime: number;

  constructor() {
    this.mount();
  }

  public mount(): void {
    this.reqStack = new ReqStack();
    this.inlineComletionsDebounceTime = 300;
  }

  async provideInlineCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    context: monaco.languages.InlineCompletionContext,
    token: monaco.CancellationToken,
  ) {
    this.cancelRequest();

    // 放入队列
    const requestImp = new CompletionRequest(model, position, token);
    this.reqStack.addReq(requestImp);

    await raceCancellation(sleep(this.inlineComletionsDebounceTime), token);

    const list = await this.reqStack.runReq();
    if (!list) {
      return undefined;
    }
    inlineCompletionCache.column = position.column;
    inlineCompletionCache.line = position.lineNumber;
    inlineCompletionCache.last = {
      items: list,
    };
    return inlineCompletionCache.last;
  }

  cancelRequest() {
    if (this.reqStack) {
      this.reqStack.cancelReq();
    }
  }
}
