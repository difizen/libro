import type { Event } from '../../common/index.js';
import { Emitter } from '../../common/index.js';
import { singleton } from '../../mana-syringe/index.js';

export type SelectionProvider<T> = {
  onSelectionChanged: Event<T | undefined>;
};

@singleton()
export class SelectionService
  implements SelectionProvider<Record<any, any> | undefined>
{
  private currentSelection: Record<any, any> | undefined;

  protected readonly onSelectionChangedEmitter = new Emitter<any>();
  readonly onSelectionChanged: Event<any> = this.onSelectionChangedEmitter.event;

  get selection(): Record<any, any> | undefined {
    return this.currentSelection;
  }

  set selection(selection: Record<any, any> | undefined) {
    this.currentSelection = selection;
    this.onSelectionChangedEmitter.fire(this.currentSelection);
  }
}
