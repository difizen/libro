import type { Newable } from '@difizen/mana-common';

import { Syringe } from '../core';
import { transient } from '../decorator';
import { registerSideOption } from '../side-option';

export const AutoFactoryOption = Syringe.defineToken('AutoFactoryOption');
export const AutoFactoryMeta = Syringe.defineToken('AutoFactoryMeta', {
  multiple: false,
});

export function autoFactory<T = any>() {
  return (target: Newable<T>): void => {
    const AutoFactoryToken = Symbol();
    Reflect.defineMetadata(AutoFactoryMeta, AutoFactoryToken, target);
    transient()(target);
    registerSideOption(
      {
        token: AutoFactoryToken,
        useFactory: (ctx: Syringe.Context) => {
          return (option: any) => {
            const child = ctx.container.createChild();
            child.register({ token: AutoFactoryOption, useValue: option });
            return child.get(target);
          };
        },
      },
      target,
    );
  };
}

export type ToAutoFactory<T extends Newable<any>> = (
  option: ConstructorParameters<T>[0],
) => InstanceType<T>;

export const toAutoFactory = <T extends Newable<any>>(
  target: T,
): Syringe.Token<(...args: ConstructorParameters<T>) => InstanceType<T>> => {
  const factoryToken = Reflect.getOwnMetadata(AutoFactoryMeta, target);
  if (!factoryToken) {
    throw new Error(`Cannot find factory token for ${target.constructor.name}`);
  }
  return factoryToken;
};
