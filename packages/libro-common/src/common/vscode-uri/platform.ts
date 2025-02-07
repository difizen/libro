/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// !!!!!
// SEE https://github.com/microsoft/vscode/blob/master/src/vs/base/common/platform.ts
// !!!!!

declare const process: { platform: 'win32' };
declare const navigator: { userAgent: string };

export let isWindows: boolean;

if (typeof process === 'object') {
  isWindows = process.platform === 'win32';
} else if (typeof navigator === 'object') {
  const userAgent = navigator.userAgent;
  isWindows = userAgent.indexOf('Windows') >= 0;
}
