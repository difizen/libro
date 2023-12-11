import { inject, singleton } from '@difizen/mana-app';
import type { IOnigLib, IRawGrammar, IRawTheme } from 'vscode-textmate';
import { Registry, parseRawGrammar } from 'vscode-textmate';

import { TextmateRegistry } from './textmate-registry.js';

export const isBasicWasmSupported = typeof (window as any).WebAssembly !== 'undefined';
export const OnigurumaPromise = Symbol('OnigasmPromise');
export type OnigurumaPromise = Promise<IOnigLib>;

@singleton()
export class MonacoGrammarRegistry {
  public registry?: Registry;
  protected readonly textmateRegistry: TextmateRegistry;
  protected readonly onigasmPromise: OnigurumaPromise;
  constructor(
    @inject(TextmateRegistry) textmateRegistry: TextmateRegistry,
    @inject(OnigurumaPromise) onigasmPromise: OnigurumaPromise,
  ) {
    this.textmateRegistry = textmateRegistry;
    this.onigasmPromise = onigasmPromise;
  }

  getRegistry(theme: IRawTheme): Registry {
    return new Registry({
      onigLib: this.onigasmPromise,
      theme,
      loadGrammar: async (scopeName: string) => {
        const provider = this.textmateRegistry.getProvider(scopeName);
        if (provider) {
          const definition = await provider.getGrammarDefinition();
          let rawGrammar: IRawGrammar;
          if (typeof definition.content === 'string') {
            rawGrammar = parseRawGrammar(
              definition.content,
              definition.format === 'json' ? 'grammar.json' : 'grammar.plist',
            );
          } else {
            rawGrammar = definition.content as unknown as IRawGrammar;
          }
          return rawGrammar;
        }
        return undefined;
      },
      getInjections: (scopeName: string) => {
        const provider = this.textmateRegistry.getProvider(scopeName);
        if (provider && provider.getInjections) {
          return provider.getInjections(scopeName);
        }
        return [];
      },
    });
  }
  setupRegistry(theme: IRawTheme): void {
    this.registry = new Registry({
      onigLib: this.onigasmPromise,
      theme,
      loadGrammar: async (scopeName: string) => {
        const provider = this.textmateRegistry.getProvider(scopeName);
        if (provider) {
          const definition = await provider.getGrammarDefinition();
          let rawGrammar: IRawGrammar;
          if (typeof definition.content === 'string') {
            rawGrammar = parseRawGrammar(
              definition.content,
              definition.format === 'json' ? 'grammar.json' : 'grammar.plist',
            );
          } else {
            rawGrammar = definition.content as unknown as IRawGrammar;
          }
          return rawGrammar;
        }
        return undefined;
      },
      getInjections: (scopeName: string) => {
        const provider = this.textmateRegistry.getProvider(scopeName);
        if (provider && provider.getInjections) {
          return provider.getInjections(scopeName);
        }
        return [];
      },
    });
  }
}
