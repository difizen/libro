import type { ColorRegistry } from '@difizen/mana-app';
import { Color, ColorContribution } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';

@singleton({ contrib: ColorContribution })
export class LabColorContribution implements ColorContribution {
  registerColors(colors: ColorRegistry): void {
    // common
    colors.register(
      // #region antd variable
      {
        id: 'libro.lab.welcome.background.color',
        defaults: { dark: '#1f2022', light: '#FFFFFF' },
        description: '',
      },
      {
        id: 'libro.lab.welcome.h1.color',
        defaults: {
          dark: '#edeeef',
          light: '#000A1A',
        },
        description: 'welcome',
      },
      {
        id: 'libro.lab.server.info.title.text',
        defaults: { dark: '#BDC0C4', light: Color.rgba(0, 10, 26, 0.89) },
        description: '',
      },
      {
        id: 'libro.lab.server.info.text',
        defaults: {
          dark: '#e3e4e6',
          light: Color.rgba(0, 10, 26, 0.78),
        },
        description: 'welcome',
      },
      {
        id: 'libro.lab.welcome.h3.text',
        defaults: {
          dark: '#EDEEEF',
          light: Color.rgba(0, 10, 26, 0.89),
        },
        description: 'welcome',
      },
      {
        id: 'libro.lab.welcome.entry.point.text',
        defaults: {
          dark: '#D6D8DA',
          light: Color.rgba(0, 10, 26, 0.68),
        },
        description: 'welcome',
      },
      {
        id: 'libro.lab.welcome.entry.point.background',
        defaults: {
          dark: Color.rgba(255, 255, 255, 0.08),
          light: '#000a1a05',
        },
        description: 'welcome',
      },
      {
        id: 'libro.lab.welcome.entry.point.hover.background',
        defaults: {
          dark: Color.rgba(255, 255, 255, 0.16),
          light: Color.rgba(0, 10, 26, 0.04),
        },
        description: 'welcome',
      },
    );
  }
}
