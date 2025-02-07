import assert from 'assert';

import { ObservableConfig, Observability } from './index';

describe('ObservableConfig', () => {
  it('#exclude', () => {
    const obj = {};
    assert(Observability.canBeObservable(obj));
    ObservableConfig.exclude((o) => o === obj);
    assert(!Observability.canBeObservable(obj));
  });
});
