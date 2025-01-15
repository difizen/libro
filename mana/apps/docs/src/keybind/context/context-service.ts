import type { IContextKey } from '@difizen/mana-app';
import { ContextKeyService } from '@difizen/mana-app';
import { inject, postConstruct, singleton } from '@difizen/mana-app';

@singleton()
export class Context {
  @inject(ContextKeyService)
  protected readonly contextKeyService!: ContextKeyService;

  protected _shiftMode!: IContextKey<boolean>;
  get shiftMode(): IContextKey<boolean> {
    return this._shiftMode;
  }

  protected _ctrlcmdMode!: IContextKey<boolean>;
  /** True if Explorer view has keyboard focus. */
  get ctrlcmdMode(): IContextKey<boolean> {
    return this._ctrlcmdMode;
  }

  @postConstruct()
  protected init(): void {
    this._shiftMode = this.contextKeyService.createKey<boolean>('shiftMode', false);
    this._ctrlcmdMode = this.contextKeyService.createKey<boolean>('ctrlcmdMode', false);
  }
}
