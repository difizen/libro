/* eslint-disable no-param-reassign */
import type { HTMLSearchMatch } from './libro-search-protocol.js';

const UNSUPPORTED_ELEMENTS = [
  'BASE',
  'HEAD',
  'LINK',
  'META',
  'STYLE',
  'TITLE',
  'SVG',
  'SOURCE',
  'SCRIPT',
  'BODY',
  'AREA',
  'AUDIO',
  'IMG',
  'MAP',
  'TRACK',
  'VIDEO',
  'APPLET',
  'EMBED',
  'IFRAME',
  'NOEMBED',
  'OBJECT',
  'PARAM',
  'PICTURE',
  'CANVAS',
  'NOSCRIPT',
];

export const searchInHTML = async (
  query: RegExp,
  rootNode: Node,
): Promise<HTMLSearchMatch[]> => {
  if (!(rootNode instanceof Node)) {
    console.warn(
      'Unable to search with HTMLSearchEngine the provided object.',
      rootNode,
    );
    return [];
  }
  if (!query.global) {
    query = new RegExp(query.source, query.flags + 'g');
  }
  const matches: HTMLSearchMatch[] = [];
  const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      let parentElement = node.parentElement!;
      while (parentElement !== rootNode) {
        if (UNSUPPORTED_ELEMENTS.includes(parentElement.nodeName)) {
          return NodeFilter.FILTER_REJECT;
        }
        parentElement = parentElement.parentElement!;
      }
      return query.test(node.textContent!)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });
  let node: Node | null = null;
  while ((node = walker.nextNode()) !== null) {
    query.lastIndex = 0;
    let match: RegExpExecArray | null = null;
    while ((match = query.exec(node.textContent!)) !== null) {
      matches.push({
        text: match[0],
        position: match.index,
        node: node as Text,
      });
    }
  }
  return Promise.resolve(matches);
};
