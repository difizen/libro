/* eslint-disable global-require */
import type { ThemeRegistry } from '@difizen/libro-cofine-editor-core';
import { ThemeContribution } from '@difizen/libro-cofine-editor-core';
import { singleton } from '@difizen/libro-common/mana-app';

import jupyterDark from './data/jupyter_dark.json';
import jupyterHCDark from './data/jupyter_hc_dark.json';
import jupyterHCLight from './data/jupyter_hc_light.json';
import jupyterLight from './data/jupyter_light.json';
import libroDark from './data/libro_dark.json';
import libroLight from './data/libro_light.json';

@singleton({ contrib: ThemeContribution })
export class LibroPythonThemeContribution implements ThemeContribution {
  registerItem(registry: ThemeRegistry): void {
    if (!registry.mixedThemeEnable) {
      console.warn('cannot register textmate themes');
      return;
    }

    // theme名称必须满足 ^[a-z0-9\-]+$， 必须提供base theme
    // jupyter theme from https://github.com/sam-the-programmer/vscode-jupyter-theme
    registry.registerMixedTheme(jupyterLight, 'jupyter-light', 'vs');
    registry.registerMixedTheme(jupyterDark, 'jupyter-dark', 'vs-dark');
    registry.registerMixedTheme(jupyterHCLight, 'jupyter-hc-light', 'hc-black');
    registry.registerMixedTheme(jupyterHCDark, 'jupyter-hc-dark', 'hc-black');

    /**
     * libro theme based on jupyter theme, 支持python;
     * 同时兼容sql和log, 如果有其他语言需要支持，需要在主题中指定对应的token和颜色;
     * monaco不同编辑器实例无法使用不同的主题，所有的编辑器实例共享一个主题，后创建的编辑器会覆盖更新全局的主题，所以libro所有e2编辑器必须使用同一个主题!
     */
    registry.registerMixedTheme(libroLight, 'libro-light', 'vs');
    registry.registerMixedTheme(libroDark, 'libro-dark', 'vs-dark');
  }
}
