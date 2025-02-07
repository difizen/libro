import 'react';
import assert from 'assert';

import { Container } from '@difizen/mana-syringe';

import { ThemeService } from '../theme-service';

import { AntdColorContribution } from './antd-color-contribution';
import { ColorRegistry } from './color-registry';
import { DefaultColorContribution } from './default-color-contribution';

describe('theme color', () => {
  it('#antd color', () => {
    const ctrb = new AntdColorContribution();
    const registry = new ColorRegistry();
    ctrb.registerColors(registry);
    const ids = [...registry.getDefinitionIds()];
    const filtered = ids.filter((item) => item.startsWith('ant'));
    assert(filtered.length > 100);
  });

  it('#get color', () => {
    const container = new Container();
    container.register(DefaultColorContribution);
    container.register(ColorRegistry);
    container.register(ThemeService);
    const ctrb = container.get(DefaultColorContribution);
    const registry = container.get(ColorRegistry);
    ctrb.registerColors(registry);
    const color = registry.getCurrentColor('color.bg.container');
    assert(color === '#ffffff');
  });
});
