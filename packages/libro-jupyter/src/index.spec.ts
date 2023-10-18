import assert from 'assert';

import { JupyterFileService, LibroJupyterModel } from './index.js';
import 'reflect-metadata';

describe('libro-jupyter', () => {
  it('#import', () => {
    assert(JupyterFileService);
    assert(LibroJupyterModel);
  });
});
