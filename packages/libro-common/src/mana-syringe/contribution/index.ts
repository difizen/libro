import * as Protocol from './contribution-protocol';
import { contributionRegister } from './contribution-register';

export * from './contribution-protocol';
export * from './contribution-provider';
export * from './decorator';

export namespace Contribution {
  export type Option = Protocol.Option;
  export type Provider<T extends Record<string, any>> = Protocol.Provider<T>;
  export const Provider = Protocol.Provider;
  export const register = contributionRegister;
}
