import { LibroService } from '@difizen/libro-jupyter';
import type { CellView, NotebookView } from '@difizen/libro-jupyter';
import type {
  Command,
  CommandHandler,
  CommandRegistry,
  CommandHandlerWithContext,
} from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';

export interface GeneralAIWidgetCommandHandler extends CommandHandler {
  execute: (
    code?: string,
    cell?: CellView,
    libro?: NotebookView,
    position?: string,
    options?: any,
  ) => void;
  isVisible?: (
    code?: string,
    cell?: CellView,
    libro?: NotebookView,
    position?: string,
    options?: any,
  ) => boolean;
  isEnabled?: (
    code?: string,
    cell?: CellView,
    libro?: NotebookView,
    position?: string,
    options?: any,
  ) => boolean;
  isActive?: (
    code?: string,
    cell?: CellView,
    libro?: NotebookView,
    position?: string,
    options?: any,
  ) => boolean;
}

@singleton()
export class AIWidgetCommandRegister {
  @inject(LibroService) protected readonly libroService: LibroService;

  toGeneralCommandArgs = (
    ctx: AIWidgetCommandRegister,
    code?: string,
    cell?: CellView,
    libro?: NotebookView,
    position?: string,
    options?: any,
  ): [
    string | undefined,
    CellView | undefined,
    NotebookView | undefined,
    string | undefined,
    any,
  ] => {
    const libroView = libro || ctx.libroService.active;
    const cellView = cell || libroView?.model?.active;
    return [code, cellView, libroView, position, options];
  };

  registerAIWidgetCommand(
    registry: CommandRegistry,
    command: Command,
    handler: GeneralAIWidgetCommandHandler,
  ) {
    const commandHandler: CommandHandlerWithContext<AIWidgetCommandRegister> = {
      execute: (
        ctx,
        code?: string,
        cell?: CellView,
        libro?: NotebookView,
        position?: string,
        options?: any,
      ) => {
        return handler.execute(
          ...this.toGeneralCommandArgs(ctx, code, cell, libro, position, options),
        );
      },
    };
    if (handler.isEnabled) {
      commandHandler.isEnabled = (
        ctx,
        code?: string,
        cell?: CellView,
        libro?: NotebookView,
        position?: string,
        options?: any,
      ) => {
        if (!handler.isEnabled) {
          return true;
        }
        return handler.isEnabled(
          ...this.toGeneralCommandArgs(ctx, code, cell, libro, position, options),
        );
      };
    }
    if (handler.isVisible) {
      commandHandler.isVisible = (
        ctx,
        code?: string,
        cell?: CellView,
        libro?: NotebookView,
        position?: string,
        options?: any,
      ) => {
        if (!handler.isVisible) {
          return true;
        }
        return handler.isVisible(
          ...this.toGeneralCommandArgs(ctx, code, cell, libro, position, options),
        );
      };
    }
    if (handler.isActive) {
      commandHandler.isActive = (
        ctx,
        code?: string,
        cell?: CellView,
        libro?: NotebookView,
        position?: string,
        options?: any,
      ) => {
        if (!handler.isActive) {
          return false;
        }
        return handler.isActive(
          ...this.toGeneralCommandArgs(ctx, code, cell, libro, position, options),
        );
      };
    }
    registry.registerCommandWithContext(command, this, commandHandler);
  }
}
