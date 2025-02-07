import 'react';
import assert from 'assert';

import { AntdVariableContribution } from './antd-variable-contribution';
import { VariableRegistry } from './variable-registry';

describe('theme basic', () => {
  it('#antd variable', () => {
    const ctrb = new AntdVariableContribution();
    const registry = new VariableRegistry();
    ctrb.registerVariables(registry);
    const ids = [...registry.getDefinitionIds()];
    const filtered = ids.filter((item) => item.startsWith('ant'));
    assert(filtered.length > 90);
  });
});
