/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export interface ILocalizeInfo {
  key: string;
  comment: string[];
}

/**
 * Localize a message.
 *
 * `message` can contain `{n}` notation where it is replaced by the nth value in `...args`
 * For example, `localize({ key: 'sayHello', comment: ['Welcomes user'] }, 'hello {0}', name)`
 */
export function localize(
  info: ILocalizeInfo,
  message: string,
  ...args: (string | number | boolean | undefined | null)[]
): string;

/**
 * Localize a message.
 *
 * `message` can contain `{n}` notation where it is replaced by the nth value in `...args`
 * For example, `localize('sayHello', 'hello {0}', name)`
 */
export function localize(
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  key: string,
  message: string,
  ...args: (string | number | boolean | undefined | null)[]
): string;

export function localize(
  key: ILocalizeInfo | string,
  message: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ..._args: (string | number | boolean | undefined | null)[]
): string {
  if (typeof key === 'string') {
    return key + message;
  }
  return key.comment + message;
}
