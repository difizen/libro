import { pythonLanguage } from '@codemirror/lang-python';
import { LspCompletionTriggerKind } from '@difizen/libro-lsp';
import { LspCompletionItemKind } from '@difizen/libro-lsp';

import type { Completion, CompletionSource } from '../auto-complete/index.js';

import type { CMLSPExtension } from './protocol.js';
import { offsetToPos, renderMarkupContent } from './util.js';

export type CompletionItemDetailReolve = (
  completion: Completion,
) => Node | null | Promise<Node | null>;

const CompletionItemKindMap = Object.fromEntries(
  Object.entries(LspCompletionItemKind).map(([key, value]) => [value, key]),
) as Record<LspCompletionTriggerKind, string>;

function toSet(chars: Set<string>) {
  let preamble = '';
  let flat = Array.from(chars).join('');
  const words = /\w/.test(flat);
  if (words) {
    preamble += '\\w';
    flat = flat.replace(/\w/g, '');
  }
  return `[${preamble}${flat.replace(/[^\w\s]/g, '\\$&')}]`;
}

function prefixMatch(options: Completion[]) {
  const first = new Set<string>();
  const rest = new Set<string>();

  for (const { apply } of options) {
    const [initial, ...restStr] = apply as string;
    first.add(initial);
    for (const char of restStr) {
      rest.add(char);
    }
  }

  const source = toSet(first) + toSet(rest) + '*$';
  return [new RegExp('^' + source), new RegExp(source)];
}

export const lspPythonCompletion: CMLSPExtension = ({ lspProvider }) => {
  const completionSource: CompletionSource = async (context) => {
    /**
     * 只在显式的使用tab触发时调用kernel completion
     * 只在只在隐式的输入时触发时调用lsp completion
     */
    if (!lspProvider || context.explicit === true) {
      return null;
    }

    const { virtualDocument: doc, lspConnection, editor } = await lspProvider();

    const { state } = context;
    let { pos } = context;

    if (
      !lspConnection ||
      !lspConnection.isReady ||
      !lspConnection.provides('completionProvider')
    ) {
      return null;
    }

    const { line, character } = offsetToPos(state.doc, pos);

    const rootPos = doc.transformFromEditorToRoot(editor, {
      line,
      ch: character,
      isEditor: true,
    });

    if (!rootPos) {
      return null;
    }

    const virtualPos = doc.virtualPositionAtDocument(rootPos);

    const result = await lspConnection.clientRequests[
      'textDocument/completion'
    ].request({
      position: { line: virtualPos.line, character: virtualPos.ch },
      textDocument: {
        uri: doc.documentInfo.uri,
      },
      context: {
        triggerKind: LspCompletionTriggerKind.Invoked,
      },
    });

    if (!result) {
      return null;
    }

    const items = 'items' in result ? result.items : result;

    let options = items.map((item) => {
      const { detail, label, kind, textEdit, documentation, sortText, filterText } =
        item;
      const completion: Completion & {
        filterText: string;
        sortText?: string;
        apply: string;
      } = {
        label,
        detail,
        apply: textEdit?.newText ?? label,
        type: kind && CompletionItemKindMap[kind].toLowerCase(),
        sortText: sortText ?? label,
        filterText: filterText ?? label,
      };
      if (documentation) {
        const resolver: CompletionItemDetailReolve = async () => {
          return renderMarkupContent(documentation);
        };
        completion.info = resolver;
      } else {
        const resolver: CompletionItemDetailReolve = async () => {
          const itemResult =
            await lspConnection.clientRequests['completionItem/resolve'].request(item);
          return itemResult.documentation
            ? renderMarkupContent(itemResult.documentation)
            : null;
        };

        completion.info = resolver;
      }
      return completion;
    });

    const [, match] = prefixMatch(options);
    const token = context.matchBefore(match);

    // TODO: sort 方法需要进一步改进
    if (token) {
      pos = token.from;
      const word = token.text.toLowerCase();
      if (/^\w+$/.test(word)) {
        options = options
          .filter(({ filterText }) => filterText.toLowerCase().startsWith(word))
          .sort(
            ({ apply: a, sortText: sortTexta }, { apply: b, sortText: sortTextb }) => {
              switch (true) {
                case sortTexta !== undefined && sortTextb !== undefined:
                  return sortTexta!.localeCompare(sortTextb!);
                case a.startsWith(token.text) && !b.startsWith(token.text):
                  return -1;
                case !a.startsWith(token.text) && b.startsWith(token.text):
                  return 1;
              }
              return 0;
            },
          );
      }
    } else {
      options = options.sort(({ sortText: sortTexta }, { sortText: sortTextb }) => {
        switch (true) {
          case sortTexta !== undefined && sortTextb !== undefined:
            return sortTexta!.localeCompare(sortTextb!);
        }
        return 0;
      });
    }

    return {
      from: pos,
      options,
    };
  };
  return pythonLanguage.data.of({
    autocomplete: completionSource,
  });
};
