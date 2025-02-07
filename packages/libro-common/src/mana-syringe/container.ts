import type { Disposable } from '@difizen/mana-common';
import { DisposableCollection, Emitter } from '@difizen/mana-common';
import type { interfaces } from 'inversify';
import { Container as InversifyContainer } from 'inversify';

import { ContainerAPI } from './container-api';
import { Syringe } from './core';
import { Utils } from './core';
import {
  GlobalContainer as InversifyGlobalContainer,
  namedToIdentifier,
  tokenToIdentifier,
} from './inversify-api';
import type { InversifyContext } from './inversify-api/inversify-protocol';
import { isSyringeModule } from './module';
import { Register } from './register';

export const ContainerMeta = Symbol('ContainerMeta');

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Container implements Syringe.Container, InversifyContext, Disposable {
  disposed?: boolean | undefined;
  protected toDisposeOnParentChange = new DisposableCollection();
  protected onModuleChangedEmitter = new Emitter<void>();
  get onModuleChanged() {
    return this.onModuleChangedEmitter.event;
  }
  protected onRegisteredEmitter = new Emitter<void>();
  get onRegistered() {
    return this.onRegisteredEmitter.event;
  }
  protected _parent?: Container | undefined;
  get parent(): Container | undefined {
    return this._parent;
  }
  set parent(p: Container | undefined) {
    this._parent = p;
    if (this.toDisposeOnParentChange) {
      this.toDisposeOnParentChange.dispose();
      this.toDisposeOnParentChange = new DisposableCollection();
    }
    if (p) {
      this.toDisposeOnParentChange.push(
        p.onModuleChanged(() => {
          this.onModuleChangedEmitter.fire();
        }),
      );
      this.toDisposeOnParentChange.push(
        p.onRegistered(() => {
          this.onRegisteredEmitter.fire();
        }),
      );
    }
  }
  static config(option: Syringe.InjectOption<void>): void {
    Register.globalConfig = option;
  }

  protected loadedModules: number[] = [];
  container: interfaces.Container;
  constructor(inversifyContainer?: interfaces.Container) {
    if (inversifyContainer) {
      this.container = inversifyContainer;
    } else {
      this.container = new InversifyContainer();
    }
    ContainerAPI.setCache(this.container, this);
    this.register({
      token: Syringe.ContextToken,
      useDynamic: (ctx) => {
        return ctx;
      },
      lifecycle: Syringe.Lifecycle.singleton,
    });
  }
  dispose() {
    this.toDisposeOnParentChange.dispose();
    this.onModuleChangedEmitter.dispose();
    this.onRegisteredEmitter.dispose();
    this.disposed = true;
  }
  load(module: Syringe.Module, force?: boolean, deep = true): void {
    if (force || !this.loadedModules.includes(module.id)) {
      if (isSyringeModule(module)) {
        if (deep) {
          const { dependencies } = module.toLoader();
          if (dependencies) {
            for (const dep of dependencies) {
              this.load(dep);
            }
          }
        }
        this.container.load(module.inversifyModule);
        this.onModuleChangedEmitter.fire();
      } else {
        console.warn(
          `Unsupported module${module.name ? ` ${module.name}` : ''}.`,
          module,
        );
      }
      this.loadedModules.push(module.id);
    }
  }
  unload(module: Syringe.Module): void {
    if (isSyringeModule(module)) {
      this.container.unload(module.inversifyModule);
      this.onModuleChangedEmitter.fire();
      this.loadedModules = this.loadedModules.filter((id) => id !== module.id);
    }
  }
  remove<T>(token: Syringe.Token<T>): void {
    return this.container.unbind(tokenToIdentifier(token));
  }
  get<T>(token: Syringe.Token<T>): T {
    return this.container.get(tokenToIdentifier(token));
  }
  getNamed<T>(token: Syringe.Token<T>, named: Syringe.Named): T {
    return this.container.getNamed(tokenToIdentifier(token), namedToIdentifier(named));
  }
  getAll<T>(token: Syringe.Token<T>): T[] {
    return this.container.getAll(tokenToIdentifier(token));
  }
  getAllNamed<T>(token: Syringe.Token<T>, named: Syringe.Named): T[] {
    return this.container.getAllNamed(
      tokenToIdentifier(token),
      namedToIdentifier(named),
    );
  }

  isBound<T>(token: Syringe.Token<T>): boolean {
    return this.container.isBound(tokenToIdentifier(token));
  }

  isBoundNamed<T>(token: Syringe.Token<T>, named: Syringe.Named): boolean {
    return this.container.isBoundNamed(
      tokenToIdentifier(token),
      namedToIdentifier(named),
    );
  }

  createChild(): Syringe.Container {
    const childContainer = this.container.createChild();
    const child = new Container(childContainer);
    child.parent = this;
    return child;
  }
  register<T = any>(tokenOrOption: Syringe.Token<T> | Syringe.InjectOption<T>): void;
  register<T = any>(token: Syringe.Token<T>, options: Syringe.InjectOption<T>): void;
  register<T = any>(
    token: Syringe.Token<T> | Syringe.InjectOption<T>,
    options: Syringe.InjectOption<T> = {},
  ): void {
    if (Utils.isInjectOption(token)) {
      Register.resolveOption(this, token);
    } else {
      Register.resolveTarget(this, token, options);
    }
    this.onRegisteredEmitter.fire();
  }
}

export const GlobalContainer = new Container(InversifyGlobalContainer);

export const register: Syringe.Register =
  GlobalContainer.register.bind(GlobalContainer);

ContainerAPI.toContainer = (ctn) => {
  const container = new Container(ctn);
  return container;
};
