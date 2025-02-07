import type { ColorRegistry } from '@difizen/mana-core';
import { Color } from '@difizen/mana-core';
import { ColorContribution } from '@difizen/mana-core';
import { singleton } from '@difizen/mana-syringe';

@singleton({ contrib: ColorContribution })
export class MenuColorRegistry implements ColorContribution {
  registerColors(colors: ColorRegistry): void {
    colors.register(
      {
        id: 'menu.item.hover.bg',
        defaults: {
          dark: 'transparent',
          light: Color.rgba(0, 0, 0, 0.06),
        },
        description: '',
      },
      {
        id: 'menu.item.hover.color',
        defaults: {
          dark: Color.rgba(255, 255, 255),
          light: Color.rgba(0, 0, 0, 0.88),
        },
        description: '',
      },
      {
        id: 'menu.item.color',
        defaults: {
          dark: Color.rgba(255, 255, 255, 0.65),
          light: Color.rgba(0, 0, 0, 0.88),
        },
        description: '',
      },
      {
        id: 'menu.item.active.color',
        defaults: {
          dark: Color.rgba(255, 255, 255),
          light: 'primary.color',
        },
        description: '',
      },
      {
        id: 'menu.item.active.bg',
        defaults: {
          dark: 'primary.color',
          light: 'primary.color-1',
        },
        description: '',
      },
    );
  }
}
