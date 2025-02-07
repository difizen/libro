/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Event, WaitUntilEvent } from '@difizen/mana-common';
import type React from 'react';

/**
 * A command is a unique identifier of a function
 * which can be executed by a user via a keyboard shortcut,
 * a menu action or directly.
 */
export type Command = {
  /**
   * A unique identifier of this command.
   */
  id: string;
  /**
   * A label of this command.
   */
  label?: string;
  /**
   * An icon class of this command.
   */
  icon?: React.ReactNode | React.FC;
  /**
   * A category of this command.
   */
  category?: string;
};

export namespace Command {
  /* Determine whether object is a Command */
  export function is(arg: Command | any): arg is Command {
    return !!arg && arg === Object(arg) && 'id' in arg;
  }

  /** Comparator function for when sorting commands */
  export function compareCommands(a: Command, b: Command): number {
    if (a.label && b.label) {
      const aCommand = (
        a.category ? `${a.category}: ${a.label}` : a.label
      ).toLowerCase();
      const bCommand = (
        b.category ? `${b.category}: ${b.label}` : b.label
      ).toLowerCase();
      return aCommand.localeCompare(bCommand);
    }
    return 0;
  }

  /**
   * Determine if two commands are equal.
   *
   * @param a the first command for comparison.
   * @param b the second command for comparison.
   */
  export function equals(a: Command, b: Command): boolean {
    return a.id === b.id && a.label === b.label && a.category === b.category;
  }
}
export type ExecuteHandler = {
  execute?: ((...args: any[]) => any) | undefined;
};
export type EnabledHandler = {
  /**
   * Test whether this handler is enabled (active).
   */
  isEnabled?: ((...args: any[]) => boolean) | undefined;
};

export type VisibleHandler = {
  /**
   * Test whether menu items for this handler should be visible.
   */
  isVisible?: ((...args: any[]) => boolean) | undefined;
};

export type ActiveHandler = {
  /**
   * Test whether menu items for this handler should be active.
   */
  isActive?: ((...args: any[]) => boolean) | undefined;
};
/**
 * A command handler is an implementation of a command.
 *
 * A command can have multiple handlers
 * but they should be active in different contexts,
 * otherwise first active will be executed.
 */
export type CommandHandler = {
  /**
   * Execute this handler.
   */
  execute: (...args: any[]) => any;
} & EnabledHandler &
  ActiveHandler &
  VisibleHandler;

/**
 * A command handler is an implementation of a command.
 *
 * A command can have multiple handlers
 * but they should be active in different contexts,
 * otherwise first active will be executed.
 */
export type CommandHandlerWithContext<T = any> = {
  /**
   * Execute this handler.
   */
  execute: (ctx: T, ...args: any[]) => any;
  /**
   * Test whether this handler is enabled (active).
   */
  isEnabled?: (ctx: T, ...args: any[]) => boolean;
  /**
   * Test whether menu items for this handler should be visible.
   */
  isVisible?: (ctx: T, ...args: any[]) => boolean;
  /**
   * Test whether menu items for this handler should be active.
   */
  isActive?: (ctx: T, ...args: any[]) => boolean;
};

export type CommandEvent = {
  commandId: string;
  args: any[];
};

export type WillExecuteCommandEvent = Record<any, any> & WaitUntilEvent & CommandEvent;

export const CommandService = Symbol('CommandService');
/**
 * The command service should be used to execute commands.
 */
export type CommandService = {
  /**
   * Execute the active handler for the given command and arguments.
   *
   * Reject if a command cannot be executed.
   */
  executeCommand: <T>(command: string, ...args: any[]) => Promise<T | undefined>;
  /**
   * An event is emitted when a command is about to be executed.
   *
   * It can be used to install or activate a command handler.
   */
  readonly onWillExecuteCommand: Event<WillExecuteCommandEvent>;
  /**
   * An event is emitted when a command was executed.
   */
  readonly onDidExecuteCommand: Event<CommandEvent>;
};
