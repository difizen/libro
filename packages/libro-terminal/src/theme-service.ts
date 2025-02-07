import type { ThemeChangeEvent, Event } from '@difizen/libro-common/app';
import { ColorRegistry, ThemeService } from '@difizen/libro-common/app';
import { inject, singleton } from '@difizen/libro-common/app';
import type { ITheme } from 'xterm';

/**
 * It should be aligned with https://github.com/microsoft/vscode/blob/0dfa355b3ad185a6289ba28a99c141ab9e72d2be/src/vs/workbench/contrib/terminal/common/terminalColorRegistry.ts#L40
 */
export const terminalAnsiColorMap: {
  [key: string]: {
    index: number;
    defaults: { light: any; dark: any; [key: string]: any };
  };
} = {
  'terminal.ansiBlack': {
    index: 0,
    defaults: {
      light: '#000000',
      dark: '#000000',
      hc: '#000000',
    },
  },
  'terminal.ansiRed': {
    index: 1,
    defaults: {
      light: '#cd3131',
      dark: '#cd3131',
      hc: '#cd0000',
    },
  },
  'terminal.ansiGreen': {
    index: 2,
    defaults: {
      light: '#00BC00',
      dark: '#0DBC79',
      hc: '#00cd00',
    },
  },
  'terminal.ansiYellow': {
    index: 3,
    defaults: {
      light: '#949800',
      dark: '#e5e510',
      hc: '#cdcd00',
    },
  },
  'terminal.ansiBlue': {
    index: 4,
    defaults: {
      light: '#0451a5',
      dark: '#2472c8',
      hc: '#0000ee',
    },
  },
  'terminal.ansiMagenta': {
    index: 5,
    defaults: {
      light: '#bc05bc',
      dark: '#bc3fbc',
      hc: '#cd00cd',
    },
  },
  'terminal.ansiCyan': {
    index: 6,
    defaults: {
      light: '#0598bc',
      dark: '#11a8cd',
      hc: '#00cdcd',
    },
  },
  'terminal.ansiWhite': {
    index: 7,
    defaults: {
      light: '#555555',
      dark: '#e5e5e5',
      hc: '#e5e5e5',
    },
  },
  'terminal.ansiBrightBlack': {
    index: 8,
    defaults: {
      light: '#666666',
      dark: '#666666',
      hc: '#7f7f7f',
    },
  },
  'terminal.ansiBrightRed': {
    index: 9,
    defaults: {
      light: '#cd3131',
      dark: '#f14c4c',
      hc: '#ff0000',
    },
  },
  'terminal.ansiBrightGreen': {
    index: 10,
    defaults: {
      light: '#14CE14',
      dark: '#23d18b',
      hc: '#00ff00',
    },
  },
  'terminal.ansiBrightYellow': {
    index: 11,
    defaults: {
      light: '#b5ba00',
      dark: '#f5f543',
      hc: '#ffff00',
    },
  },
  'terminal.ansiBrightBlue': {
    index: 12,
    defaults: {
      light: '#0451a5',
      dark: '#3b8eea',
      hc: '#5c5cff',
    },
  },
  'terminal.ansiBrightMagenta': {
    index: 13,
    defaults: {
      light: '#bc05bc',
      dark: '#d670d6',
      hc: '#ff00ff',
    },
  },
  'terminal.ansiBrightCyan': {
    index: 14,
    defaults: {
      light: '#0598bc',
      dark: '#29b8db',
      hc: '#00ffff',
    },
  },
  'terminal.ansiBrightWhite': {
    index: 15,
    defaults: {
      light: '#a5a5a5',
      dark: '#e5e5e5',
      hc: '#ffffff',
    },
  },
};

@singleton()
export class TerminalThemeService {
  @inject(ColorRegistry)
  protected readonly colorRegistry: ColorRegistry;

  readonly onDidChange: Event<ThemeChangeEvent> =
    ThemeService.get().onDidColorThemeChange;

  get theme(): ITheme {
    const foregroundColor = this.colorRegistry.getCurrentColor('terminal.foreground');
    const backgroundColor =
      this.colorRegistry.getCurrentColor('terminal.background') ||
      this.colorRegistry.getCurrentColor('panel.background');
    const cursorColor =
      this.colorRegistry.getCurrentColor('terminalCursor.foreground') ||
      foregroundColor;
    const cursorAccentColor =
      this.colorRegistry.getCurrentColor('terminalCursor.background') ||
      backgroundColor;
    const selectionBackground = this.colorRegistry.getCurrentColor(
      'terminal.selectionBackground',
    );

    const theme: ITheme = {
      background: backgroundColor,
      foreground: foregroundColor,
      cursor: cursorColor,
      cursorAccent: cursorAccentColor,
      selectionBackground: selectionBackground,
      // selection: selectionColor,
    };
    // eslint-disable-next-line guard-for-in
    for (const id in terminalAnsiColorMap) {
      const colorId = id.substring(13);
      const colorName = colorId.charAt(0).toLowerCase() + colorId.slice(1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (theme as any)[colorName] = this.colorRegistry.getCurrentColor(id);
    }
    return theme;
  }

  getTheme(type: 'light' | 'dark' | 'default' = 'light'): ITheme {
    switch (type) {
      case 'light':
        return this.lightTheme;
      case 'dark':
        return this.darkTheme;
      case 'default':
      default:
        return this.theme;
    }
  }

  // jupyter terminal theme
  lightTheme: ITheme = {
    foreground: '#000',
    background: '#fff',
    cursor: '#616161', // md-grey-700
    cursorAccent: '#F5F5F5', // md-grey-100
    selectionBackground: 'rgba(97, 97, 97, 0.3)', // md-grey-700
    selectionInactiveBackground: 'rgba(189, 189, 189, 0.3)', // md-grey-400
  };

  darkTheme: ITheme = {
    foreground: '#fff',
    background: '#000',
    cursor: '#fff',
    cursorAccent: '#000',
    selectionBackground: 'rgba(255, 255, 255, 0.3)',
    selectionInactiveBackground: 'rgba(238, 238, 238, 0.3)', // md-grey-200
  };
}
