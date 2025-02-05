import type { EditorCancellationToken } from '@difizen/libro-code-editor';

import { lineBasedCompletionModelConfigs } from './contant.js';

// 去除多余的空行，并且限制前文的长度
function processPrefix(prompt: string): string {
  // remove all empty lines
  prompt = prompt.replace(/^s*[\n]/gm, '');
  const arr = prompt.split('\n');
  // if the number of lines is greater than n, take the last n lines
  if (arr.length > lineBasedCompletionModelConfigs.completionPromptMaxLineSize) {
    prompt = arr
      .slice(-lineBasedCompletionModelConfigs.completionPromptMaxLineSize)
      .join('\n');
  }
  return prompt;
}

// 去除多余的空行，并且限制后文的长度
function processSuffix(suffix: string): string {
  suffix = suffix.replace(/^s*[\n]/gm, '');
  const arr = suffix.split('\n');
  if (arr.length > lineBasedCompletionModelConfigs.completionSuffixMaxLineSize) {
    suffix = arr
      .slice(-lineBasedCompletionModelConfigs.completionSuffixMaxLineSize)
      .join('\n');
  }
  return suffix;
}

export const lineBasedPromptProcessor = {
  processPrefix,
  processSuffix,
};

export function sleep(time: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, time));
}

export function raceCancellation<T>(
  promise: Promise<T>,
  token: EditorCancellationToken,
): Promise<T | undefined>;
export function raceCancellation<T>(
  promise: Promise<T>,
  token: EditorCancellationToken,
  defaultValue: T,
): Promise<T>;
export function raceCancellation<T>(
  promise: Promise<T>,
  token: EditorCancellationToken,
  defaultValue?: T,
): Promise<T | undefined> {
  return Promise.race([
    promise,
    new Promise<T | undefined>((resolve) =>
      token.onCancellationRequested(() => resolve(defaultValue)),
    ),
  ]);
}
