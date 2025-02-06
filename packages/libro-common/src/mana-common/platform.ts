/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const LANGUAGE_DEFAULT = 'en';

let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;
let _isLinuxSnap = false;
let _isNative = false;
let _isWeb = false;
let _isIOS = false;
let _locale: string | undefined;
let _language: string = LANGUAGE_DEFAULT;
let _translationsConfigFile: string | undefined;
let _userAgent: string | undefined;

let _isIE = false;
let _isEdge = false;
let _isOpera = false;
let _isFirefox = false;
let _isWebKit = false;
let _isChrome = true;
let _isSafari = false;
let _isIPad = false;

interface NLSConfig {
  locale: string;
  availableLanguages: Record<string, string>;
  _translationsConfigFile: string;
}

export type IProcessEnvironment = Record<string, string>;

export interface INodeProcess {
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
export const isElectronSandboxed = isElectronRenderer && nodeProcess?.sandboxed;
export const browserCodeLoadingCacheStrategy:
  | 'none'
  | 'code'
  | 'bypassHeatCheck'
  | 'bypassHeatCheckAndEagerCompile'
  | undefined = (() => {
  // Always enabled when sandbox is enabled
  if (isElectronSandboxed) {
    return 'bypassHeatCheck';
  }

  // Otherwise, only enabled conditionally
  const env = nodeProcess?.env['ENABLE_VSCODE_BROWSER_CODE_LOADING'];
  if (typeof env === 'string') {
    if (
      env === 'none' ||
      env === 'code' ||
      env === 'bypassHeatCheck' ||
      env === 'bypassHeatCheckAndEagerCompile'
    ) {
      return env;
    }

    return 'bypassHeatCheck';
  }

  return undefined;
})();
export const isPreferringBrowserCodeLoad =
  typeof browserCodeLoadingCacheStrategy === 'string';

// Web environment
if (typeof navigator === 'object' && !isElectronRenderer) {
  _userAgent = navigator.userAgent;
  _isWindows = _userAgent.indexOf('Windows') >= 0;
  _isMacintosh = _userAgent.indexOf('Macintosh') >= 0;
  _isIOS =
    (_userAgent.indexOf('Macintosh') >= 0 ||
      _userAgent.indexOf('iPad') >= 0 ||
      _userAgent.indexOf('iPhone') >= 0) &&
    !!navigator.maxTouchPoints &&
    navigator.maxTouchPoints > 0;
  _isLinux = _userAgent.indexOf('Linux') >= 0;
  _isWeb = true;
  _locale = ((navigator as any).languages as string)
    ? ((navigator as any).languages[0] as string)
    : navigator.language || ((navigator as any).userLanguage as string);
  _language = _locale;
  _isIE = _userAgent.indexOf('Trident') >= 0;
  _isEdge = _userAgent.indexOf('Edge/') >= 0;
  _isOpera = _userAgent.indexOf('Opera') >= 0;
  _isFirefox = _userAgent.indexOf('Firefox') >= 0;
  _isWebKit = _userAgent.indexOf('AppleWebKit') >= 0;
  _isChrome = _userAgent.indexOf('Chrome') >= 0;
  _isSafari = _userAgent.indexOf('Chrome') === -1 && _userAgent.indexOf('Safari') >= 0;
  _isIPad = _userAgent.indexOf('iPad') >= 0;
}

// Native environment
else if (typeof nodeProcess === 'object') {
  _isWindows = nodeProcess.platform === 'win32';
  _isMacintosh = nodeProcess.platform === 'darwin';
  _isLinux = nodeProcess.platform === 'linux';
  _isLinuxSnap =
    _isLinux && !!nodeProcess.env['SNAP'] && !!nodeProcess.env['SNAP_REVISION'];
  _locale = LANGUAGE_DEFAULT;
  _language = LANGUAGE_DEFAULT;
  const rawNlsConfig = nodeProcess.env['VSCODE_NLS_CONFIG'];
  if (rawNlsConfig) {
    try {
      const nlsConfig: NLSConfig = JSON.parse(rawNlsConfig);
      const resolved = nlsConfig.availableLanguages['*'];
      _locale = nlsConfig.locale;
      // VSCode's default language is 'en'
      _language = resolved || LANGUAGE_DEFAULT;
      _translationsConfigFile = nlsConfig._translationsConfigFile;
    } catch (e) {
      //
    }
  }
  _isNative = true;
}

// Unknown environment
else {
  console.error('Unable to resolve platform.');
}

export enum Platform {
  Web,
  Mac,
  Linux,
  Windows,
}
export function PlatformToString(platform: Platform) {
  switch (platform) {
    case Platform.Web:
      return 'Web';
    case Platform.Mac:
      return 'Mac';
    case Platform.Linux:
      return 'Linux';
    case Platform.Windows:
      return 'Windows';
  }
}

let _platform: Platform = Platform.Web;
if (_isMacintosh) {
  _platform = Platform.Mac;
} else if (_isWindows) {
  _platform = Platform.Windows;
} else if (_isLinux) {
  _platform = Platform.Linux;
}

export const isWindows = _isWindows;
export const isMacintosh = _isMacintosh;
export const isOSX = _isMacintosh;
export const isLinux = _isLinux;
export const isLinuxSnap = _isLinuxSnap;
export const isNative = _isNative;
export const isWeb = _isWeb;
export const isIOS = _isIOS;
export const platform = _platform;
export const userAgent = _userAgent;

export const isIE = _isIE;
export const isEdge = _isEdge;
export const isEdgeOrIE = isIE || isEdge;
export const isOpera = _isOpera;
export const isFirefox = _isFirefox;
export const isWebKit = _isWebKit;
export const isChrome = _isChrome;
export const isSafari = _isSafari;
export const isIPad = _isIPad;

/**
 * The language used for the user interface. The format of
 * the string is all lower case (e.g. zh-tw for Traditional
 * Chinese)
 */
export const language = _language;

export namespace Language {
  export function value(): string {
    return language;
  }

  export function isDefaultVariant(): boolean {
    if (language.length === 2) {
      return language === 'en';
    }
    if (language.length >= 3) {
      return language[0] === 'e' && language[1] === 'n' && language[2] === '-';
    }
    return false;
  }

  export function isDefault(): boolean {
    return language === 'en';
  }
}

/**
 * The OS locale or the locale specified by --locale. The format of
 * the string is all lower case (e.g. zh-tw for Traditional
 * Chinese). The UI is not necessarily shown in the provided locale.
 */
export const locale = _locale;

/**
 * The translatios that are available through language packs.
 */
export const translationsConfigFile = _translationsConfigFile;

export const globals: any = _globals;

export enum OperatingSystem {
  Windows = 1,
  Macintosh = 2,
  Linux = 3,
}
export const OS =
  _isMacintosh || _isIOS
    ? OperatingSystem.Macintosh
    : _isWindows
      ? OperatingSystem.Windows
      : OperatingSystem.Linux;

let _isLittleEndian = true;
let _isLittleEndianComputed = false;
export function isLittleEndian(): boolean {
  if (!_isLittleEndianComputed) {
    _isLittleEndianComputed = true;
    const test = new Uint8Array(2);
    test[0] = 1;
    test[1] = 2;
    const view = new Uint16Array(test.buffer);
    _isLittleEndian = view[0] === (2 << 8) + 1;
  }
  return _isLittleEndian;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isBasicWasmSupported =
  isWeb && typeof (window as any).WebAssembly !== 'undefined';
