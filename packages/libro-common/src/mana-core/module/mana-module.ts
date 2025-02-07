import type { MaybePromise } from '@difizen/mana-common';
import { Deferred } from '@difizen/mana-common';
import { SyringeModule } from '@difizen/mana-syringe';

import type { CanloadModule, ModuleLoader, ModulePreload } from './module-protocol';

export class ManaModule extends SyringeModule<MaybePromise<ManaModule>> {
  protected preloadMethod?: ModulePreload;
  protected canloadMethod?: CanloadModule;
  /**
   * @internal
   */
  loadDefer = new Deferred<void>();

  get load() {
    return this.loadDefer.promise;
  }

  canload(fn: CanloadModule) {
    this.canloadMethod = fn;
    return this;
  }

  preload(fn: ModulePreload) {
    this.preloadMethod = fn;
    return this;
  }
  override toLoader(): ModuleLoader {
    return {
      dependencies: this.dependencies.length > 0 ? this.dependencies : undefined,
      preload: this.preloadMethod,
      canload: this.canloadMethod,
    };
  }
  static create(name?: string) {
    return new ManaModule(name);
  }
}

export namespace ManaModule {
  export function is(data: Record<any, any> | undefined): data is ManaModule {
    return !!data && typeof data === 'object' && 'toLoader' in data;
  }
}
