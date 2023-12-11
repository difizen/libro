import 'reflect-metadata';
import assert from 'assert';

import { LanguageWorkerContribution } from './index.js';

describe('libro-cofine-editor-contribution', () => {
  it('#import', () => {
    assert(LanguageWorkerContribution);
  });
});
