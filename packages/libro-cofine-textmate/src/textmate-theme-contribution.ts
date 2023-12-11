/* eslint-disable global-require */
import type { ThemeRegistry } from '@difizen/libro-cofine-editor-core';
import { ThemeContribution } from '@difizen/libro-cofine-editor-core';
import { singleton } from '@difizen/mana-app';

import darkDefault from './data/monaco-themes/vscode/dark_defaults.json';
import darkEditor from './data/monaco-themes/vscode/dark_editor.json';
import darkPlus from './data/monaco-themes/vscode/dark_plus.json';
import darkVS from './data/monaco-themes/vscode/dark_vs.json';
import HCBlack from './data/monaco-themes/vscode/hc_black.json';
import HCBlackDefault from './data/monaco-themes/vscode/hc_black_defaults.json';
import HCEditor from './data/monaco-themes/vscode/hc_editor.json';
import lightDefault from './data/monaco-themes/vscode/light_defaults.json';
import lightEditor from './data/monaco-themes/vscode/light_editor.json';
import lightPlus from './data/monaco-themes/vscode/light_plus.json';
import lightVS from './data/monaco-themes/vscode/light_vs.json';

@singleton({ contrib: ThemeContribution })
export class TextmateThemeContribution implements ThemeContribution {
  registerItem(registry: ThemeRegistry): void {
    if (!registry.mixedThemeEnable) {
      console.warn('cannot register textmate themes');
      return;
    }
    registry.registerMixedTheme(darkDefault, 'dark_defaults.json');
    registry.registerMixedTheme(darkVS, 'dark_vs.json');
    registry.registerMixedTheme(darkPlus, 'dark_plus.json');
    registry.registerMixedTheme(darkEditor, 'e2-dark', 'vs-dark');

    registry.registerMixedTheme(lightDefault, 'light_defaults.json');
    registry.registerMixedTheme(lightVS, 'light_vs.json');
    registry.registerMixedTheme(lightPlus, 'light_plus.json');
    registry.registerMixedTheme(lightEditor, 'e2-light', 'vs');

    registry.registerMixedTheme(HCBlackDefault, 'hc_black_defaults.json');
    registry.registerMixedTheme(HCBlack, 'hc_black.json');
    registry.registerMixedTheme(HCEditor, 'e2-hc', 'hc-black');
  }
}
