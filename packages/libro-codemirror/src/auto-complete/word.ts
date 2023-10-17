/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-shadow */
import type { Text } from '@codemirror/state';

import type { Completion, CompletionSource } from './completion.js';

const enum C {
  Range = 50000,
  MinCacheLen = 1000,
  MaxList = 2000,
}

function wordRE(wordChars: string) {
  const escaped = wordChars.replace(/[\\[.+*?(){|^$]/g, '\\$&');
  try {
    return new RegExp(`[\\p{Alphabetic}\\p{Number}_${escaped}]+`, 'ug');
  } catch {
    // eslint-disable-next-line no-useless-escape
    return new RegExp(`[\w${escaped}]`, 'g');
  }
}

function mapRE(re: RegExp, f: (source: string) => string) {
  return new RegExp(f(re.source), re.unicode ? 'u' : '');
}

const wordCaches: Record<string, WeakMap<Text, readonly Completion[]>> = Object.create(
  null,
);

function wordCache(wordChars: string) {
  return wordCaches[wordChars] || (wordCaches[wordChars] = new WeakMap());
}

function storeWords(
  doc: Text,
  wordRE: RegExp,
  result: Completion[],
  seen: Record<string, boolean>,
  ignoreAt: number,
) {
  for (let lines = doc.iterLines(), pos = 0; !lines.next().done; ) {
    let { value } = lines,
      m;
    wordRE.lastIndex = 0;
    while ((m = wordRE.exec(value))) {
      if (!seen[m[0]] && pos + m.index !== ignoreAt) {
        result.push({ type: 'text', label: m[0] });
        seen[m[0]] = true;
        if (result.length >= C.MaxList) {
          return;
        }
      }
    }
    pos += value.length + 1;
  }
}

function collectWords(
  doc: Text,
  cache: WeakMap<Text, readonly Completion[]>,
  wordRE: RegExp,
  to: number,
  ignoreAt: number,
) {
  const big = doc.length >= C.MinCacheLen;
  const cached = big && cache.get(doc);
  if (cached) {
    return cached;
  }
  const result: Completion[] = [],
    seen: Record<string, boolean> = Object.create(null);
  if (doc.children) {
    let pos = 0;
    for (const ch of doc.children) {
      if (ch.length >= C.MinCacheLen) {
        for (const c of collectWords(ch, cache, wordRE, to - pos, ignoreAt - pos)) {
          if (!seen[c.label]) {
            seen[c.label] = true;
            result.push(c);
          }
        }
      } else {
        storeWords(ch, wordRE, result, seen, ignoreAt - pos);
      }
      pos += ch.length + 1;
    }
  } else {
    storeWords(doc, wordRE, result, seen, ignoreAt);
  }
  if (big && result.length < C.MaxList) {
    cache.set(doc, result);
  }
  return result;
}

/// A completion source that will scan the document for words (using a
/// [character categorizer](#state.EditorState.charCategorizer)), and
/// return those as completions.
export const completeAnyWord: CompletionSource = (context) => {
  const wordChars = context.state
    .languageDataAt<string>('wordChars', context.pos)
    .join('');
  const re = wordRE(wordChars);
  const token = context.matchBefore(mapRE(re, (s) => s + '$'));
  if (!token && !context.explicit) {
    return null;
  }
  const from = token ? token.from : context.pos;
  const options = collectWords(
    context.state.doc,
    wordCache(wordChars),
    re,
    C.Range,
    from,
  );
  return { from, options, validFor: mapRE(re, (s) => '^' + s) };
};
