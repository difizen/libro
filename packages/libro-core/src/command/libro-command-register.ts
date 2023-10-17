import type {
  Command,
  CommandHandler,
  CommandHandlerWithContext,
  CommandRegistry,
  KeybindingRegistry,
} from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';

import type { CellView, NotebookView } from '../libro-protocol.js';
import { LibroContextKeys } from '../libro-protocol.js';
import { LibroService } from '../libro-service.js';

export interface GeneralLibroCommandHandler extends CommandHandler {
  execute: (
    cell?: CellView,
    libro?: NotebookView,
    position?: string,
    options?: any,
  ) => void;
  isVisible?: (
    cell?: CellView,
    libro?: NotebookView,
    position?: string,
    options?: any,
  ) => boolean;
  isEnabled?: (
    cell?: CellView,
    libro?: NotebookView,
    position?: string,
    options?: any,
  ) => boolean;
  isActive?: (
    cell?: CellView,
    libro?: NotebookView,
    position?: string,
    options?: any,
  ) => boolean;
}

@singleton()
export class LibroCommandRegister {
  protected readonly libroService: LibroService;
  constructor(@inject(LibroService) libroService: LibroService) {
    this.libroService = libroService;
  }
  registerKeybinds(
    keybindings: KeybindingRegistry,
    commands: Record<
      string,
      Command & {
        keybind?: string | string[];
        when?: string;
        preventDefault?: boolean;
        stopPropagation?: boolean;
      }
    >,
    needActive = true,
    needFocus = true,
  ) {
    const keys = Object.keys(commands);
    for (const key of keys) {
      const command = commands[key];
      if (command.keybind) {
        const needFocusStr = needFocus ? LibroContextKeys.focus : '';
        const needActiveStr = needActive ? LibroContextKeys.active : '';
        const when = [needFocusStr, needActiveStr, command.when]
          .filter(Boolean)
          .join(' && ');
        if (command.keybind instanceof Array) {
          command.keybind.forEach((keybind) => {
            keybindings.registerKeybinding({
              command: command.id,
              keybinding: keybind,
              when: when,
              preventDefault: command.preventDefault,
              stopPropagation: command.stopPropagation,
            });
          });
        } else {
          keybindings.registerKeybinding({
            command: command.id,
            keybinding: command.keybind,
            when: when,
            preventDefault: command.preventDefault,
            stopPropagation: command.stopPropagation,
          });
        }
      }
    }
  }
  toGeneralCommandArgs = (
    ctx: LibroCommandRegister,
    cell?: CellView,
    libro?: NotebookView,
    position?: string,
    options?: any,
  ): [CellView | undefined, NotebookView | undefined, string | undefined, any] => {
    const libroView = libro || ctx.libroService.active;
    const cellView = cell || libroView?.model?.active;
    return [cellView, libroView, position, options];
  };
  registerLibroCommand(
    registry: CommandRegistry,
    command: Command,
    handler: GeneralLibroCommandHandler,
  ) {
    const commandHandler: CommandHandlerWithContext<LibroCommandRegister> = {
      execute: (
        ctx,
        cell?: CellView,
        libro?: NotebookView,
        position?: string,
        options?: any,
      ) => {
        return handler.execute(
          ...this.toGeneralCommandArgs(ctx, cell, libro, position, options),
        );
      },
    };
    if (handler.isEnabled) {
      commandHandler.isEnabled = (
        ctx,
        cell?: CellView,
        libro?: NotebookView,
        position?: string,
        options?: any,
      ) => {
        if (!handler.isEnabled) {
          return true;
        }
        return handler.isEnabled(
          ...this.toGeneralCommandArgs(ctx, cell, libro, position, options),
        );
      };
    }
    if (handler.isVisible) {
      commandHandler.isVisible = (
        ctx,
        cell?: CellView,
        libro?: NotebookView,
        position?: string,
        options?: any,
      ) => {
        if (!handler.isVisible) {
          return true;
        }
        return handler.isVisible(
          ...this.toGeneralCommandArgs(ctx, cell, libro, position, options),
        );
      };
    }
    if (handler.isActive) {
      commandHandler.isActive = (
        ctx,
        cell?: CellView,
        libro?: NotebookView,
        position?: string,
        options?: any,
      ) => {
        if (!handler.isActive) {
          return false;
        }
        return handler.isActive(
          ...this.toGeneralCommandArgs(ctx, cell, libro, position, options),
        );
      };
    }
    registry.registerCommandWithContext(command, this, commandHandler);
  }
}
