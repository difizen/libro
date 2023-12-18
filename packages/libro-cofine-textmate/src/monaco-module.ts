/* eslint-disable func-names */
/* eslint-disable global-require */

import { Module } from '@difizen/mana-app';
import * as oniguruma from 'vscode-oniguruma';
import * as onig from 'vscode-oniguruma/release/onig.wasm';

import {
  isBasicWasmSupported,
  MonacoGrammarRegistry,
  OnigurumaPromise,
} from './monaco-grammar-registry.js';
import { MonacoTextmateService } from './monaco-textmate-service.js';
import { MonacoThemeRegistry } from './monaco-theme-registry.js';
import { LanguageGrammarDefinitionContribution } from './textmate-contribution.js';
import { TextmateRegistry } from './textmate-registry.js';
import { TextmateThemeContribution } from './textmate-theme-contribution.js';

export async function fetchOniguruma(): Promise<ArrayBuffer | Response> {
  // const onigurumaPath = 'https://unpkg.com/vscode-oniguruma@2.0.1/release/onig.wasm'; // webpack doing its magic here
  const onigurumaPath = onig;
  let onigurumaUrl = onigurumaPath;
  if (typeof onigurumaPath !== 'string' && onigurumaPath.default) {
    onigurumaUrl = onigurumaPath.default;
  }

  const response = await fetch(onigurumaUrl);
  const contentType = response.headers.get('content-type');
  if (contentType === 'application/wasm') {
    return response;
  }

  // Using the response directly only works if the server sets the MIME type 'application/wasm'.
  // Otherwise, a TypeError is thrown when using the streaming compiler.
  // We therefore use the non-streaming compiler :(.
  return await response.arrayBuffer();
}

const vscodeOnigurumaLib = fetchOniguruma().then(async (buffer) => {
  await oniguruma.loadWASM(buffer);
  return oniguruma;
});

export const TextmateModule = Module()
  .register(
    {
      token: OnigurumaPromise,
      useValue: isBasicWasmSupported
        ? vscodeOnigurumaLib
        : Promise.reject(new Error('wasm not supported')),
    },
    MonacoTextmateService,
    TextmateRegistry,
    MonacoThemeRegistry,
    TextmateThemeContribution,
    MonacoGrammarRegistry,
  )
  .contribution(LanguageGrammarDefinitionContribution);
export default TextmateModule;
