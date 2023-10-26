import type { ConfigurationNode } from '@difizen/mana-app';
import { isOSX, isWindows, singleton } from '@difizen/mana-app';

export type TerminalRendererType = 'canvas' | 'dom';
export const DEFAULT_TERMINAL_RENDERER_TYPE = 'canvas';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTerminalRendererType(arg: any): arg is TerminalRendererType {
  return typeof arg === 'string' && (arg === 'canvas' || arg === 'dom');
}

export type CursorStyle = 'block' | 'underline' | 'bar';

export const terminalEnableCopy: ConfigurationNode<any> = {
  id: 'terminal.enableCopy',
  schema: {
    type: 'boolean',
  },

  description: 'Enable ctrl-c (cmd-c on macOS) to copy selected text',
  defaultValue: true,
};
export const terminalEnablePaste: ConfigurationNode<any> = {
  id: 'terminal.enablePaste',
  schema: {
    type: 'boolean',
  },

  description: 'Enable ctrl-v (cmd-v on macOS) to paste from clipboard',
  defaultValue: true,
};
export const terminalIntegratedFontFamily: ConfigurationNode<any> = {
  id: 'terminal.integrated.fontFamily',
  schema: {
    type: 'string',
  },

  description:
    "Controls the font family of the terminal, this defaults to `#editor.fontFamily#`'s value.",
  defaultValue: isOSX
    ? "Menlo, Monaco, 'Courier New', monospace"
    : isWindows
    ? "Consolas, 'Courier New', monospace"
    : "'Droid Sans Mono', 'monospace', monospace",
};
export const terminalIntegratedFontSize: ConfigurationNode<any> = {
  id: 'terminal.integrated.fontSize',
  schema: {
    type: 'number',
    minimum: 6,
  },

  description: 'Controls the font size in pixels of the terminal.',
  defaultValue: 12,
};
export const terminalIntegratedFontWeight: ConfigurationNode<any> = {
  id: 'terminal.integrated.fontWeight',
  schema: {
    type: 'string',
  },

  // enum: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
  description:
    'The font weight to use within the terminal for non-bold text. Accepts "normal" and "bold" keywords or numbers between 1 and 1000.',
  defaultValue: 'normal',
};
export const terminalIntegratedFontWeightBold: ConfigurationNode<any> = {
  id: 'terminal.integrated.fontWeightBold',
  schema: {
    type: 'string',
  },

  // enum: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
  description:
    'The font weight to use within the terminal for bold text. Accepts "normal" and "bold" keywords or numbers between 1 and 1000.',
  defaultValue: 'bold',
};
export const terminalIntegratedDrawBoldTextInBrightColors: ConfigurationNode<any> = {
  id: 'terminal.integrated.drawBoldTextInBrightColors',
  description:
    'Controls whether bold text in the terminal will always use the "bright" ANSI color variant.',
  schema: {
    type: 'boolean',
  },

  defaultValue: true,
};
export const terminalIntegratedLetterSpacing: ConfigurationNode<any> = {
  id: 'terminal.integrated.letterSpacing',
  description:
    'Controls the letter spacing of the terminal, this is an integer value which represents the amount of additional pixels to add between characters.',
  schema: {
    type: 'number',
  },

  defaultValue: 1,
};
export const terminalIntegratedLineHeight: ConfigurationNode<any> = {
  id: 'terminal.integrated.lineHeight',
  description:
    'Controls the line height of the terminal, this number is multiplied by the terminal font size to get the actual line-height in pixels.',
  schema: {
    type: 'number',
    minimum: 1,
  },

  defaultValue: 1,
};
export const terminalIntegratedScrollback: ConfigurationNode<any> = {
  id: 'terminal.integrated.scrollback',
  description: 'Controls the maximum amount of lines the terminal keeps in its buffer.',
  schema: {
    type: 'number',
  },

  defaultValue: 1000,
};
export const terminalIntegratedFastScrollSensitivity: ConfigurationNode<any> = {
  id: 'terminal.integrated.fastScrollSensitivity',
  description: 'Scrolling speed multiplier when pressing `Alt`.',
  schema: {
    type: 'number',
  },

  defaultValue: 5,
};
export const terminalIntegratedRendererType: ConfigurationNode<any> = {
  id: 'terminal.integrated.rendererType',
  description: 'Controls how the terminal is rendered.',
  schema: {
    type: 'string',
  },

  // enum: ['canvas', 'dom'],
  defaultValue: 'canvas',
};
export const terminalIntegratedCopyOnSelection: ConfigurationNode<any> = {
  id: 'terminal.integrated.copyOnSelection',
  description:
    'Controls whether text selected in the terminal will be copied to the clipboard.',
  schema: {
    type: 'boolean',
  },

  defaultValue: false,
};
export const terminalIntegratedCursorBlinking: ConfigurationNode<any> = {
  id: 'terminal.integrated.cursorBlinking',
  description: 'Controls whether the terminal cursor blinks.',
  schema: {
    type: 'boolean',
  },

  defaultValue: false,
};
export const terminalIntegratedCursorStyle: ConfigurationNode<any> = {
  id: 'terminal.integrated.cursorStyle',
  description: 'Controls the style of terminal cursor.',
  // enum: ['block', 'underline', 'line'],
  defaultValue: 'block',
  schema: {
    type: 'string',
  },
};
export const terminalIntegratedCursorWidth: ConfigurationNode<any> = {
  id: 'terminal.integrated.cursorWidth',
  description:
    'Controls the width of the cursor when `#terminal.integrated.cursorStyle#` is set to `line`.',
  schema: {
    type: 'number',
  },

  defaultValue: 1,
};
export const terminalIntegratedShellWindows: ConfigurationNode<any> = {
  id: 'terminal.integrated.shell.windows',
  schema: {
    type: 'string',
  },
  // typeDetails: { isFilepath: true },
  description:
    "The path of the shell that the terminal uses on Windows. (defaultValue: '{0}').",
  defaultValue: undefined,
};
export const terminalIntegratedShellOsx: ConfigurationNode<any> = {
  id: 'terminal.integrated.shell.osx',
  schema: {
    type: 'string',
  },
  description:
    "The path of the shell that the terminal uses on macOS (defaultValue: '{0}'}).",
  defaultValue: undefined,
};
export const terminalIntegratedShellLinux: ConfigurationNode<any> = {
  id: 'terminal.integrated.shell.linux',
  schema: {
    type: 'string',
  },
  description:
    "The path of the shell that the terminal uses on Linux (defaultValue: '{0}'}).",
  defaultValue: undefined,
};
export const terminalIntegratedShellArgsWindows: ConfigurationNode<any> = {
  id: 'terminal.integrated.shellArgs.windows',
  schema: {
    type: 'string',
  },

  description: 'The command line arguments to use when on the Windows terminal.',
  defaultValue: [],
};
export const terminalIntegratedShellArgsOsx: ConfigurationNode<any> = {
  id: 'terminal.integrated.shellArgs.osx',
  schema: {
    type: 'string',
  },

  description: 'The command line arguments to use when on the macOS terminal.',
  defaultValue: ['-l'],
};
export const terminalIntegratedShellArgsLinux: ConfigurationNode<any> = {
  id: 'terminal.integrated.shellArgs.linux',
  schema: {
    type: 'string',
  },

  description: 'The command line arguments to use when on the Linux terminal.',
  defaultValue: [],
};
export const terminalIntegratedConfirmOnExit: ConfigurationNode<any> = {
  id: 'terminal.integrated.confirmOnExit',
  schema: {
    type: 'string',
  },
  description:
    'Controls whether to confirm when the window closes if there are active terminal sessions.',
  // enum: ['never', 'always', 'hasChildProcesses'],
  // enumDescriptions: [
  //     nls.localize('theia/terminal/confirmCloseNever', 'Never confirm.'),
  //     nls.localize('theia/terminal/confirmCloseAlways', 'Always confirm if there are terminals.'),
  //     nls.localize('theia/terminal/confirmCloseChildren', 'Confirm if there are any terminals that have child processes.'),
  // ],
  defaultValue: 'never',
};

@singleton()
export class TerminalConfiguration {
  configs = [
    terminalEnableCopy,
    terminalEnablePaste,
    terminalIntegratedFontFamily,
    terminalIntegratedFontSize,
    terminalIntegratedFontWeight,
    terminalIntegratedFontWeightBold,
    terminalIntegratedDrawBoldTextInBrightColors,
    terminalIntegratedLetterSpacing,
    terminalIntegratedLineHeight,
    terminalIntegratedScrollback,
    terminalIntegratedFastScrollSensitivity,
    terminalIntegratedRendererType,
    terminalIntegratedCopyOnSelection,
    terminalIntegratedCursorBlinking,
    terminalIntegratedCursorStyle,
    terminalIntegratedCursorWidth,
    terminalIntegratedShellWindows,
    terminalIntegratedShellOsx,
    terminalIntegratedShellLinux,
    terminalIntegratedShellArgsWindows,
    terminalIntegratedShellArgsOsx,
    terminalIntegratedShellArgsLinux,
    terminalIntegratedConfirmOnExit,
  ];

  get(key: string) {
    return this.configs.find((item) => item.id === key)?.defaultValue;
  }
}
