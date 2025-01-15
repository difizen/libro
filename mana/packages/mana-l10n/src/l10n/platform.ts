// This is also implemented in mana-common, but it will not be introduced for now.
// Keep this package simple.

export type IProcessEnvironment = Record<string, string>;
interface INodeProcess {
  platform: 'win32' | 'linux' | 'darwin';
  env: IProcessEnvironment;
  nextTick: () => void;
  versions?: {
    electron?: string;
  };
  sandboxed?: boolean; // Electron
  type?: string;
  cwd: () => string;
}

declare const process: INodeProcess;
declare const global: any;

interface INavigator {
  userAgent: string;
  language: string;
  maxTouchPoints?: number;
}
declare const navigator: INavigator;
declare const self: any;
const _globals =
  typeof self === 'object' ? self : typeof global === 'object' ? global : ({} as any);

let nodeProcess: INodeProcess | undefined;
if (typeof process !== 'undefined') {
  // Native environment (non-sandboxed)
  nodeProcess = process;
} else if (typeof _globals.vscode !== 'undefined') {
  // Native environment (sandboxed)
  nodeProcess = _globals.vscode.process;
}

const isElectronRenderer =
  typeof nodeProcess?.versions?.electron === 'string' &&
  nodeProcess.type === 'renderer';

let _locale: string | undefined = 'en';

if (typeof navigator === 'object' && !isElectronRenderer) {
  _locale = ((navigator as any).languages as string)
    ? ((navigator as any).languages[0] as string)
    : navigator.language || ((navigator as any).userLanguage as string);
}

export const locale = _locale;
