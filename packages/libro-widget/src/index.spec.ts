import assert from 'assert';

import { WidgetView, LibroWidgetManager } from './index.js';
import 'reflect-metadata';

describe('libro-widget', () => {
  it('#import', () => {
    assert(LibroWidgetManager);
    assert(WidgetView);
  });
});
