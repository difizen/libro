declare module 'native-keymap' {
  /*---------------------------------------------------------------------------------------------
   *  Copyright (c) Microsoft Corporation. All rights reserved.
   *  Licensed under the MIT License. See License.txt in the project root for license information.
   *--------------------------------------------------------------------------------------------*/

  export interface IWindowsKeyMapping {
    vkey: string;
    value: string;
    withShift: string;
    withAltGr: string;
    withShiftAltGr: string;
  }
  export type IWindowsKeyboardMapping = Record<string, IWindowsKeyMapping>;
  export interface ILinuxKeyMapping {
    value: string;
    withShift: string;
    withAltGr: string;
    withShiftAltGr: string;
  }
  export type ILinuxKeyboardMapping = Record<string, ILinuxKeyMapping>;
  export interface IMacKeyMapping {
    value: string;
    valueIsDeadKey: boolean;
    withShift: string;
    withShiftIsDeadKey: boolean;
    withAltGr: string;
    withAltGrIsDeadKey: boolean;
    withShiftAltGr: string;
    withShiftAltGrIsDeadKey: boolean;
  }
  export type IMacKeyboardMapping = Record<string, IMacKeyMapping>;

  export type IKeyboardMapping =
    | IWindowsKeyboardMapping
    | ILinuxKeyboardMapping
    | IMacKeyboardMapping;

  export function getKeyMap(): IKeyboardMapping;

  export interface IWindowsKeyboardLayoutInfo {
    name: string;
    id: string;
    text: string;
  }

  export interface ILinuxKeyboardLayoutInfo {
    model: string;
    group: number;
    layout: string;
    variant: string;
    options: string;
    rules: string;
  }

  export interface IMacKeyboardLayoutInfo {
    id: string;
    localizedName: string;
    lang: string;
  }

  export type IKeyboardLayoutInfo =
    | IWindowsKeyboardLayoutInfo
    | ILinuxKeyboardLayoutInfo
    | IMacKeyboardLayoutInfo;

  export function getCurrentKeyboardLayout(): IKeyboardLayoutInfo;

  export function onDidChangeKeyboardLayout(callback: () => void): void;

  export function isISOKeyboard(): boolean | undefined;
}
