import type { Text } from '@codemirror/state';
import hljs from 'highlight.js';
import MarkdownIt from 'markdown-it';
import type * as lsp from 'vscode-languageserver-protocol';
import 'highlight.js/styles/github.css';

export function posToOffset(doc: Text, pos: { line: number; character: number }) {
  if (pos.line >= doc.lines) {
    return;
  }
  const offset = doc.line(pos.line + 1).from + pos.character;
  if (offset > doc.length) {
    return;
  }
  return offset;
}

export function offsetToPos(doc: Text, offset: number) {
  const line = doc.lineAt(offset);
  return {
    line: line.number - 1,
    character: offset - line.from,
  };
}

export function formatContents(
  contents: lsp.MarkupContent | lsp.MarkedString | lsp.MarkedString[],
): string {
  if (Array.isArray(contents)) {
    return contents.map((c) => formatContents(c) + '\n\n').join('');
  } else if (typeof contents === 'string') {
    return contents;
  } else {
    return contents.value;
  }
}

export const renderMarkdownContent = (val: string) => {
  const render = new MarkdownIt({
    html: true,
    linkify: true,
    breaks: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          const hl = hljs.highlight(lang, str).value;
          return hl;
        } catch (__) {
          //
        }
      }

      return ''; // use external default escaping
    },
  });

  return render.render(val);
};

export const renderMarkupContent = (
  contents: lsp.MarkupContent | lsp.MarkedString | lsp.MarkedString[],
) => {
  const dom = document.createElement('div');
  dom.classList.add('documentation');

  const res = renderMarkdownContent(formatContents(contents));
  dom.innerHTML = res;
  return dom;
};
