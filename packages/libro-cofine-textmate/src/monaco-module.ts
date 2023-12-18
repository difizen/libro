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

export function fetchOniguruma(): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    // const onigurumaPath = 'https://unpkg.com/vscode-oniguruma@2.0.1/release/onig.wasm'; // webpack doing its magic here
    const onigurumaPath = onig;
    const request = new XMLHttpRequest();

    request.onreadystatechange = function (): void {
      if (this.readyState === XMLHttpRequest.DONE) {
        if (this.status === 200) {
          resolve(this.response);
        } else {
          reject(new Error('Could not fetch onigasm'));
        }
      }
    };
    let onigurumaUrl = onigurumaPath;
    if (typeof onigurumaPath !== 'string' && onigurumaPath.default) {
      onigurumaUrl = onigurumaPath.default;
    }
    request.open('GET', onigurumaUrl, true);
    request.responseType = 'arraybuffer';
    request.send();
  });
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
