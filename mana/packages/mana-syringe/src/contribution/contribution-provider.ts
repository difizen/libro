import type { Disposable } from '@difizen/mana-common';
import { Emitter } from '@difizen/mana-common';
import { DisposableCollection } from '@difizen/mana-common';

import type { Syringe } from '../core';

import {
  ContributionOptionConfig,
  type Option,
  type Provider,
} from './contribution-protocol';

export class DefaultContributionProvider<T extends Record<string, any>>
  implements Provider<T>, Disposable
{
  protected onChangedEmitter = new Emitter<void>();
  get onChanged() {
    return this.onChangedEmitter.event;
  }
  protected option: Option = {
    recursive: ContributionOptionConfig.recursive,
    cache: ContributionOptionConfig.cache,
  };
  protected services: T[] | undefined;
  protected readonly serviceIdentifier: Syringe.Token<T>;
  protected readonly container: Syringe.Container;
  protected toDispose = new DisposableCollection();
  constructor(
    serviceIdentifier: Syringe.Token<T>,
    container: Syringe.Container,
    option?: Option,
  ) {
    this.container = container;
    this.serviceIdentifier = serviceIdentifier;
    if (option) {
      this.option = { ...this.option, ...option };
    }
    this.toDispose.push(this.onChangedEmitter);
    this.toDispose.push(this.container.onModuleChanged(this.onCtxChanged));
    this.toDispose.push(this.container.onRegistered(this.onCtxChanged));
  }

  disposed?: boolean | undefined;
  dispose() {
    this.toDispose.dispose();
    this.disposed = true;
  }

  protected onCtxChanged = () => {
    this.services = undefined;
    this.onChangedEmitter.fire();
  };

  protected setServices(recursive: boolean): T[] {
    const currentServices: T[] = [];
    let currentContainer: Syringe.Container | undefined = this.container;
    while (currentContainer) {
      if (currentContainer.isBound(this.serviceIdentifier)) {
        const list = currentContainer.getAll(this.serviceIdentifier);
        currentServices.push(...list);
      }
      currentContainer = recursive ? currentContainer.parent : undefined;
    }
    return currentServices;
  }

  getContributions(option: Option = {}): T[] {
    const { cache, recursive } = { ...this.option, ...option };
    if (!cache || this.services === undefined) {
      this.services = this.setServices(!!recursive);
    }
    return this.services;
  }
}
