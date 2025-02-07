import type { interfaces } from 'inversify';

export type InversifyContext = {
  container: InversifyRegister;
};
export function isInversifyContext(data: Record<any, any>): data is InversifyContext {
  return (
    data &&
    typeof data === 'object' &&
    'container' in data &&
    isInversifyRegister(data['container'])
  );
}

export type InversifyRegister = {
  bind: interfaces.Bind;
  unbind: interfaces.Unbind;
  isBound: interfaces.IsBound;
  rebind: interfaces.Rebind;
};

export function isInversifyRegister(data: Record<any, any>): data is InversifyRegister {
  return (
    data &&
    typeof data === 'object' &&
    'bind' in data &&
    'unbind' in data &&
    'rebind' in data &&
    'isBound' in data
  );
}
