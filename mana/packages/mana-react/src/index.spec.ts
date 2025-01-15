import 'react';
import assert from 'assert';

import { Tabs, Dropdown, Menu, Menubar } from './index';

describe('react', () => {
  it('#react import', () => {
    assert(Tabs);
    assert(Dropdown);
    assert(Menu);
    assert(Menubar);
  });
});
