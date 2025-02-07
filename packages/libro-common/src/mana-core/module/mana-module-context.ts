import type { Syringe } from '@difizen/mana-syringe';

import { ManaModule } from './mana-module';

export class ManaContext implements Syringe.Context {
  container: Syringe.Container;
  constructor(container: Syringe.Container) {
    this.container = container;
  }
  load = async (module: Syringe.Module) => {
    if (ManaModule.is(module)) {
      const { dependencies, preload, canload } = module.toLoader();
      if (canload && (await canload(module)) === false) {
        module.load.catch(() => {
          //
        });
        module.loadDefer.reject(
          `Load ManaModule ${
            module.name && `"${module.name}"`
          } failed: canload return false`,
        );
        return;
      }
      if (dependencies) {
        for (const dep of dependencies) {
          await this.load(await dep);
        }
      }
      if (preload) {
        await preload(this);
      }
    } else {
      console.warn('Unsupported module.', module);
    }
    this.container.load(module, false, false);
    if (ManaModule.is(module)) {
      module.loadDefer.resolve();
    }
  };
}
