import type { StatefulView } from '@difizen/libro-common/mana-app';
import { BaseView } from '@difizen/libro-common/mana-app';

export abstract class BaseStatefulView extends BaseView implements StatefulView {
  constructor() {
    super();
    // setImmediate(() => {});
    Promise.resolve()
      .then(() => {
        return this.afterRestore();
      })
      .catch(console.error);
  }
  abstract storeState(): Record<string, any>;
  abstract restoreState(oldState: Record<string, any>): void;

  afterRestore() {
    // do nothing
  }
}
