import type { Contribution } from '@difizen/libro-common/mana-app';
import { contrib, inject, singleton, Syringe } from '@difizen/libro-common/mana-app';
import * as monaco from '@difizen/monaco-editor-core';

import { InitializeContribution } from './initialize-provider.js';

export const ThemeContribution = Syringe.defineToken('ThemeContribution');

export interface ITextmateThemeSetting {
  colors: Record<string, string>;
  tokenColors: IRawThemeSetting[];
  include?: string;
  name: string;
  givenName?: string;
  base?: monaco.editor.BuiltinTheme;
  givenBase?: string;
}

export interface ThemeContribution {
  registerItem: (registry: ThemeRegistry) => void;
  _registerFinish?: boolean;
}

/**
 * A single theme setting.
 */
export interface IRawThemeSetting {
  readonly name?: string;
  readonly scope?: string | string[];
  readonly settings: {
    readonly fontStyle?: string;
    readonly foreground?: string;
    readonly background?: string;
  };
}

/**
 * A TextMate theme.
 */
export interface IRawTheme {
  readonly name?: string;
  readonly settings: IRawThemeSetting[];
}

export interface MixedTheme extends IRawTheme, monaco.editor.IStandaloneThemeData {}

export interface MixedThemeRegistry {
  registerThemes: (
    themeOptions: Record<string, ITextmateThemeSetting>,
    setTheme: (name: string, data: monaco.editor.IStandaloneThemeData) => void,
  ) => void;
}
export const MixedThemeRegistry = Symbol('MixedThemeRegistry');
@singleton({ contrib: InitializeContribution })
export class ThemeRegistry implements InitializeContribution {
  contributions: ThemeContribution[];
  themeOptions: Record<string, ITextmateThemeSetting> = {};
  themes: Map<string, MixedTheme | monaco.editor.IStandaloneThemeData> = new Map();
  awaysInitialized = true;

  onInitialize() {
    this.provider.getContributions({ cache: false }).forEach((item) => {
      if (item._registerFinish) {
        return;
      }
      item.registerItem(this);
      item._registerFinish = true;
    });
    if (this.mixedThemeEnable) {
      this.mixedThemeRegistry.registerThemes(
        this.themeOptions,
        this.setTheme.bind(this),
      );
    }
  }
  protected readonly provider: Contribution.Provider<ThemeContribution>;
  protected readonly mixedThemeRegistry: MixedThemeRegistry;
  constructor(
    @contrib(ThemeContribution) provider: Contribution.Provider<ThemeContribution>,
    @inject(MixedThemeRegistry) mixedThemeRegistry: MixedThemeRegistry,
  ) {
    this.provider = provider;
    this.mixedThemeRegistry = mixedThemeRegistry;
    this.contributions = this.provider.getContributions();
  }

  get mixedThemeEnable(): boolean {
    return !!(this.mixedThemeRegistry && this.mixedThemeRegistry.registerThemes);
  }

  setTheme(name: string, data: monaco.editor.IStandaloneThemeData): void {
    try {
      this.themes.set(name, data);
      // monaco auto refreshes a theme with new data
      monaco.editor.defineTheme(name, data);
    } catch (ex) {
      console.error(ex);
    }
  }

  registerMonacoTheme(
    setting: monaco.editor.IStandaloneThemeData,
    name: string,
    monacoBase?: monaco.editor.BuiltinTheme,
  ): void {
    this.setTheme(name, { ...setting, base: monacoBase || setting.base || 'vs' });
  }
  registerMixedTheme(
    setting: ITextmateThemeSetting,
    givenName: string,
    givenBase?: monaco.editor.BuiltinTheme,
  ): void {
    const name = givenName || setting.name;
    this.themeOptions[givenName] = { ...setting, givenName, name, base: givenBase };
  }
}
