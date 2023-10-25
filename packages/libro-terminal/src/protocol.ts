import type { JSONPrimitive } from '@difizen/libro-common';

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
  name: string;
  cwd?: string;
}

export const TerminalOption = Symbol('TerminalOption');

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
