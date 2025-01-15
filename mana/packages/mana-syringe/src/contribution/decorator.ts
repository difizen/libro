import type { Syringe } from '../core';
import { inject, named } from '../decorator';

import { Provider } from './contribution-protocol';

export const contrib =
  (token: Syringe.Named) =>
  (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
    targetKey: any,
    index?: number | undefined,
  ) => {
    named(token)(target, targetKey, index);
    inject(Provider)(target, targetKey, index);
  };
