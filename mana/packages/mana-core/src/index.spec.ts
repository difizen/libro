import 'react';
import assert from 'assert';

import { ManaPreset, ManaComponents, ThemeModule } from './index';

describe('app', () => {
  it('#app import', () => {
    assert(ManaPreset);
    assert(ManaComponents);
    assert(ManaComponents.Application);
    assert(ManaComponents.Context);
    assert(ThemeModule);
  });
});
