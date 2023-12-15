import type { JSONPrimitive } from '@difizen/libro-common';

import type { TerminalConnection } from './connection.js';

/**
 * The server model for a terminal session.
 */
export interface TerminalModel {
  /**
   * The name of the terminal session.
   */
  readonly name: string;
}

export interface TerminalOption {
  name?: string;
  /**
   * Current working directory.
   */
  cwd?: string;
}

export const TerminalOption = Symbol('TerminalOption');

export const TerminalConnectionFactory = Symbol('TerminalConnectionFactory');
export type TerminalConnectionFactory = (options: TerminalOption) => TerminalConnection;

/**
 * A message from the terminal session.
 */
export interface TerminalMessage {
  /**
   * The type of the message.
   */
  readonly type: TerminalMessageType;

  /**
   * The content of the message.
   */
  readonly content?: JSONPrimitive[];
}

/**
 * Valid message types for the terminal.
 */
export type TerminalMessageType = 'stdout' | 'disconnect' | 'set_size' | 'stdin';

export type TerminalConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export interface TerminalViewOption extends TerminalOption {
  name: string;
  /**
   * Human readable terminal representation on the UI.
   */
  readonly title?: string;

  initialCommand?: string;

  /**
   * Path to the executable shell. For example: `/bin/bash`, `bash`, `sh`.
   */
  readonly shellPath?: string;

  /**
   * Shell arguments to executable shell, for example: [`-l`] - without login.
   */
  readonly shellArgs?: string[];

  /**
   * Environment variables for terminal.
   */
  readonly env?: { [key: string]: string | null };

  /**
   * In case `destroyTermOnClose` is true - terminal process will be destroyed on close terminal widget, otherwise will be kept
   * alive.
   */
  readonly destroyOnClose?: boolean;

  /**
   * Terminal server side can send to the client `terminal title` to display this value on the UI. If
   * useServerTitle = true then display this title, otherwise display title defined by 'title' argument.
   */
  readonly useServerTitle?: boolean;

  /**
   * Whether it is a pseudo terminal where an extension controls its input and output.
   * 在jupyter中默认用的pseudo terminal
   */
  // readonly isPseudoTerminal?: boolean;

  /**
   * Terminal attributes. Can be useful to apply some implementation specific information.
   */
  readonly attributes?: { [key: string]: string | null };

  /**
   * Terminal kind that indicates whether a terminal is created by a user or by some extension for a user
   */
  readonly kind?: 'user' | string;
}

export const TerminalViewOption = Symbol('TerminalViewOption');
