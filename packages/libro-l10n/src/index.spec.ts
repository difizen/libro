import assert from 'assert';

import { libroVisCellLangBundles } from './index.js';
import 'reflect-metadata';

describe('libro-l10n', () => {
  it('#import', () => {
    assert(libroVisCellLangBundles);
  });
});
