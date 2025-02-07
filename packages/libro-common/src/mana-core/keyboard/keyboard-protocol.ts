/* eslint-disable @typescript-eslint/no-redeclare */
import type { Event } from '@difizen/mana-common';
import type { IKeyboardLayoutInfo, IKeyboardMapping } from 'native-keymap';

export interface NativeKeyboardLayout {
  info: IKeyboardLayoutInfo;
  mapping: IKeyboardMapping;
}

export const KeyboardLayoutProvider = Symbol('KeyboardLayoutProvider');

export interface KeyboardLayoutProvider {
  getNativeLayout: () => Promise<NativeKeyboardLayout>;
}

export const KeyboardLayoutChangeNotifier = Symbol('KeyboardLayoutChangeNotifier');

export interface KeyboardLayoutChangeNotifier {
  onDidChangeNativeLayout: Event<NativeKeyboardLayout>;
}

export interface KeyValidationInput {
  code: string;
  character: string;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
}

export const KeyValidator = Symbol('KeyValidator');

export interface KeyValidator {
  validateKey: (input: KeyValidationInput) => void;
}
