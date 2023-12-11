import type {
  MixedTheme,
  ITextmateThemeSetting,
} from '@difizen/libro-cofine-editor-core';
import { MixedThemeRegistry } from '@difizen/libro-cofine-editor-core';
import type { Color } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';
import * as monaco from '@difizen/monaco-editor-core';
import { StandaloneServices } from '@difizen/monaco-editor-core/esm/vs/editor/standalone/browser/standaloneServices';
import { IStandaloneThemeService } from '@difizen/monaco-editor-core/esm/vs/editor/standalone/common/standaloneTheme';

import { MonacoGrammarRegistry } from './monaco-grammar-registry.js';

export interface MixStandaloneTheme {
  themeData: MixedTheme;
}

@singleton({ contrib: MixedThemeRegistry })
export class MonacoThemeRegistry implements MixedThemeRegistry {
  protected readonly grammarRegistry: MonacoGrammarRegistry;
  constructor(@inject(MonacoGrammarRegistry) grammarRegistry: MonacoGrammarRegistry) {
    this.grammarRegistry = grammarRegistry;
  }
  protected registedTheme: string[] = [];
  getThemeData(): MixedTheme;
  getThemeData(name: string): MixedTheme | undefined;
  getThemeData(name?: string): MixedTheme | undefined {
    const theme = this.doGetTheme(name);
    return theme && theme.themeData;
  }

  getTheme(): MixStandaloneTheme;
  getTheme(name: string): MixStandaloneTheme | undefined;
  getTheme(name?: string): MixStandaloneTheme | undefined {
    return this.doGetTheme(name);
  }

  protected doGetTheme(name: string | undefined): MixStandaloneTheme | undefined {
    const standaloneThemeService = StandaloneServices.get(IStandaloneThemeService);
    const theme = !name
      ? standaloneThemeService.getTheme()
      : standaloneThemeService._knownThemes.get(name);
    return theme as MixStandaloneTheme | undefined;
  }

  setTheme(name: string, data: MixedTheme): void {
    // monaco auto refreshes a theme with new data
    monaco.editor.defineTheme(name, data);
  }

  registerThemes(
    themeOptions: Record<string, ITextmateThemeSetting>,
    setTheme: (name: string, data: monaco.editor.IStandaloneThemeData) => void,
  ): void {
    Object.keys(themeOptions).forEach((key) => {
      this.doRegisterThemes(themeOptions[key], themeOptions, setTheme);
    });
  }
  doRegisterThemes(
    option: ITextmateThemeSetting,
    themeOptions: Record<string, ITextmateThemeSetting>,
    setTheme: (name: string, data: monaco.editor.IStandaloneThemeData) => void,
  ): MixedTheme {
    const result: MixedTheme = {
      name: option.name,
      base: option.base || 'vs',
      inherit: true,
      colors: {},
      rules: [],
      settings: [],
    };
    if (typeof option.include !== 'undefined') {
      const parentOption = themeOptions[option.include];
      if (!parentOption || this.registedTheme.includes(parentOption.name)) {
        console.error(`Couldn't resolve includes theme ${option.include}.`);
      } else {
        const parentTheme = this.doRegisterThemes(parentOption, themeOptions, setTheme);
        Object.assign(result.colors, parentTheme.colors);
        result.rules.push(...parentTheme.rules);
        result.settings.push(...parentTheme.settings);
      }
    }
    const { tokenColors } = option;
    if (Array.isArray(tokenColors)) {
      for (const tokenColor of tokenColors) {
        if (tokenColor.scope && tokenColor.settings) {
          result.settings.push({
            scope: tokenColor.scope,
            settings: {
              foreground: this.normalizeColor(tokenColor.settings.foreground),
              background: this.normalizeColor(tokenColor.settings.background),
              fontStyle: tokenColor.settings.fontStyle,
            },
          });
        }
      }
    }
    if (option.colors) {
      Object.assign(result.colors, option.colors);
      result.encodedTokensColors = Object.keys(result.colors).map(
        (key) => result.colors[key],
      );
    }
    if (option.name && option.base) {
      for (const setting of result.settings) {
        this.transform(setting, (rule) => result.rules.push(rule));
      }

      // the default rule (scope empty) is always the first rule. Ignore all other default rules.
      const defaultTheme = StandaloneServices.get(
        IStandaloneThemeService,
      )._knownThemes.get(result.base)!;
      const foreground =
        result.colors['editor.foreground'] ||
        defaultTheme.getColor('editor.foreground');
      const background =
        result.colors['editor.background'] ||
        defaultTheme.getColor('editor.background');
      result.settings.unshift({
        settings: {
          foreground: this.normalizeColor(foreground),
          background: this.normalizeColor(background),
        },
      });

      const reg = this.grammarRegistry.getRegistry(result);
      reg.setTheme(result);
      result.encodedTokensColors = reg.getColorMap();
      // index 0 has to be set to null as it is 'undefined' by default, but monaco code expects it to be null
      if (result.encodedTokensColors) {
        result.encodedTokensColors[0] = null!;
      }
      setTheme(option.name, result);
    }
    return result;
  }

  protected transform(
    tokenColor: any,
    acceptor: (rule: monaco.editor.ITokenThemeRule) => void,
  ): void {
    if (typeof tokenColor.scope === 'undefined') {
      tokenColor.scope = [''];
    } else if (typeof tokenColor.scope === 'string') {
      tokenColor.scope = tokenColor.scope
        .split(',')
        .map((scope: string) => scope.trim());
    }

    for (const scope of tokenColor.scope) {
      acceptor({
        ...tokenColor.settings,
        token: scope,
      });
    }
  }

  protected normalizeColor(color: string | Color | undefined): string | undefined {
    if (!color) {
      return undefined;
    }
    const normalized = String(color).replace(/^#/, '').slice(0, 6);
    if (normalized.length < 6 || !normalized.match(/^[0-9A-Fa-f]{6}$/)) {
      // ignoring not normalized colors to avoid breaking token color indexes between monaco and vscode-textmate
      console.error(
        `Color '${normalized}' is NOT normalized, it must have 6 positions.`,
      );
      return undefined;
    }
    return `#${normalized}`;
  }
}

export namespace MonacoThemeRegistry {
  export const DARK_DEFAULT_THEME = 'e2-dark';
  export const LIGHT_DEFAULT_THEME = 'e2-light';
  export const HC_DEFAULT_THEME = 'e2-hc';
}
