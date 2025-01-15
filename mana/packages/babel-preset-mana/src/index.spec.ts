import assert from 'assert';

import preset from './index';

describe('babel-preset-mana', () => {
  it('#preset', async () => {
    const info = preset();
    assert(info.plugins.includes('babel-plugin-parameter-decorator'));
  });
});
