/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-shadow */

import 'reflect-metadata';
import type { Event, Newable, Abstract } from '@difizen/mana-common';

export type TokenOption = {
  multiple?: boolean;
  global?: boolean;
};

export type Decorator<T> = (target: Newable<T> | Abstract<T>) => any;

export namespace Syringe {
  /**
   * 定义注入标识，默认允许多重注入
   */
  export const defineToken = (
    name: string,
    option: Partial<TokenOption> = { multiple: true, global: false },
  ) => new Syringe.DefinedToken(name, option);
  export class DefinedToken {
    /**
     * 兼容 inversify identifier
     */
    prototype: any = {};
    protected name: string;
    readonly multiple: boolean;
    readonly symbol: symbol;
    constructor(name: string, option: Partial<TokenOption> = {}) {
      const { multiple = false, global } = option;
      this.name = name;
      this.symbol = global ? Symbol.for(this.name) : Symbol(this.name);
      this.multiple = multiple;
    }
  }

  export type Register = <T = any>(
    token: Syringe.Token<T> | Syringe.InjectOption<T>,
    options?: Syringe.InjectOption<T>,
  ) => void;

  export type Token<T> = string | symbol | Newable<T> | Abstract<T> | DefinedToken;
  export type Named = string | symbol | DefinedToken;
  export type NamedToken<T> = {
    token: Token<T>;
    named: Named;
  };
  export type OverrideToken<T> = {
    token: Token<T>;
    override: boolean;
  };

  export type Registry = (register: Register) => void;
  export type Module = {
    id: number;
    name?: string;
  };

  export function isModule(data: Record<any, any> | undefined): data is Module {
    return !!data && typeof data === 'object' && 'id' in data;
  }

  export type Container = {
    parent?: Container | undefined;
    remove: <T>(token: Syringe.Token<T>) => void;
    register: <T = any>(
      token: Syringe.Token<T> | Syringe.InjectOption<T>,
      options?: Syringe.InjectOption<T>,
    ) => void;
    load: (module: Module, force?: boolean, deep?: boolean) => void;
    unload: (module: Module) => void;
    get: <T>(token: Syringe.Token<T>) => T;
    getNamed: <T>(token: Syringe.Token<T>, named: Syringe.Named) => T;
    getAll: <T>(token: Syringe.Token<T>) => T[];
    getAllNamed: <T>(token: Syringe.Token<T>, named: Syringe.Named) => T[];
    isBound: <T>(token: Syringe.Token<T>) => boolean;
    isBoundNamed: <T>(token: Syringe.Token<T>, named: Syringe.Named) => boolean;
    createChild: () => Container;
    onModuleChanged: Event<void>;
    onRegistered: Event<void>;
  };

  export type Context = {
    container: Container;
  };
  export const ContextToken: Token<Context> = Symbol('Context');
  export type UnionToken<T> = Token<T> | NamedToken<T>;
  export type Class<T> = Newable<T>;
  export type Factory<T> = (ctx: Context) => (...args: any) => T;
  export type Dynamic<T> = (ctx: Context) => T;
  export type MaybeArray<T> = T | T[];

  export type DecoratorOption<T> = {
    token?: MaybeArray<UnionToken<T>>;
    contrib?: MaybeArray<Token<T>>;
    lifecycle?: Lifecycle;
  };

  export type TargetOption<T> = {
    contrib?: MaybeArray<Token<T>>;
  } & ValueOption<T>;

  export type ValueOption<T> = {
    useClass?: MaybeArray<Class<T>>;
    useDynamic?: MaybeArray<Dynamic<T>>;
    useFactory?: MaybeArray<Factory<T>>;
    useValue?: T;
  };

  export type InjectOption<T> = DecoratorOption<T> & ValueOption<T>;

  export enum Lifecycle {
    singleton = 'singleton',
    transient = 'transient',
  }
  export const ClassOptionSymbol = Symbol.for('SyringeClassOption');

  export type FormattedInjectOption<T> = {
    token: UnionToken<T>[];
    contrib: Token<T>[];
    useClass: Class<T>[];
    lifecycle: Lifecycle;
    useDynamic: Dynamic<T>[];
    useFactory: Factory<T>[];
    useValue?: T;
  } & InjectOption<T>;

  export const DefaultOption: Syringe.InjectOption<any> = {
    lifecycle: Lifecycle.transient,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export namespace Utils {
  export function toArray<T>(maybeArray: Syringe.MaybeArray<T> | undefined): T[] {
    if (Array.isArray(maybeArray)) {
      return maybeArray;
    }
    if (maybeArray === undefined) {
      return [];
    }
    return [maybeArray];
  }
  export function isClass(
    data?: string | symbol | Record<string, any>,
  ): data is Syringe.Class<any> {
    return !!(data && typeof data === 'function' && 'prototype' in data);
  }
  export function isDefinedToken(
    data: Record<string, any> | undefined | symbol | string | number,
  ): data is Syringe.DefinedToken {
    return !!(
      data &&
      typeof data === 'object' &&
      'symbol' in data &&
      'multiple' in data
    );
  }
  export function isInjectOption<T>(
    data: Syringe.Token<T> | Syringe.InjectOption<T> | undefined,
  ): data is Syringe.InjectOption<T> {
    return !!(data && typeof data === 'object' && 'token' in data);
  }

  export function isNamedToken<T>(
    data: Syringe.UnionToken<T> | undefined,
  ): data is Syringe.NamedToken<T> {
    return !!(data && typeof data === 'object' && 'token' in data && 'named' in data);
  }
  export function isMultipleEnabled<T>(token: Syringe.Token<T>): boolean {
    return Utils.isDefinedToken(token) && token.multiple;
  }

  export function toRegistryOption<P>(
    options: Syringe.InjectOption<P>,
  ): Syringe.FormattedInjectOption<P> {
    const token = Utils.toArray(options.token);
    const useClass = Utils.toArray(options.useClass);
    const useDynamic = Utils.toArray(options.useDynamic);
    const useFactory = Utils.toArray(options.useFactory);
    const contrib = Utils.toArray(options.contrib);
    const lifecycle = options.lifecycle || Syringe.Lifecycle.transient;

    const generalOption: Syringe.FormattedInjectOption<P> = {
      token,
      useClass,
      lifecycle: contrib.length > 0 ? Syringe.Lifecycle.singleton : lifecycle,
      contrib,
      useDynamic,
      useFactory,
    };
    if ('useValue' in options) {
      generalOption.useValue = options.useValue;
    }
    return generalOption;
  }
}
