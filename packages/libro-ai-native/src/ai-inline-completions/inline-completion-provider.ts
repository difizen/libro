import type {
  InlineCompletionProvider,
  EditorCancellationToken,
  IIntelligentCompletionsResult,
  ICompletionContext,
} from '@difizen/libro-code-editor';
import { singleton } from '@difizen/mana-app';

import { AiCompletionRequest } from './inline-completion-request.js';
import { raceCancellation, sleep } from './utils.js';

// 缓存最近一次的补全结果
const inlineCompletionCache: {
  line: number;
  column: number;
  last: IIntelligentCompletionsResult | null;
} = {
  line: -1,
  column: -1,
  last: null,
};

class ReqStack {
  queue: AiCompletionRequest[];
  constructor() {
    this.queue = [];
  }
  addReq(reqRequest: AiCompletionRequest) {
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
export class AICompletionProvider implements InlineCompletionProvider {
  reqStack: ReqStack;
  inlineComletionsDebounceTime: number;

  constructor() {
    this.mount();
  }

  public mount(): void {
    this.reqStack = new ReqStack();
    this.inlineComletionsDebounceTime = 500;
  }

  async provideInlineCompletionItems(
    context: ICompletionContext,
    token: EditorCancellationToken,
  ) {
    this.cancelRequest();

    // 放入队列
    const requestImp = new AiCompletionRequest(context, token);
    this.reqStack.addReq(requestImp);

    await raceCancellation(sleep(this.inlineComletionsDebounceTime), token);

    if (token?.isCancellationRequested) {
      return undefined;
    }

    const list = await this.reqStack.runReq();
    if (!list) {
      return undefined;
    }
    if (context.position) {
      inlineCompletionCache.column = context.position.column;
      inlineCompletionCache.line = context.position.line;
    }
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
