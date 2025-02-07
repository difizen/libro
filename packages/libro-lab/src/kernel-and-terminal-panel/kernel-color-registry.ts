import type { ColorRegistry } from '@difizen/libro-common/mana-app';
import { Color, ColorContribution } from '@difizen/libro-common/mana-app';
import { singleton } from '@difizen/libro-common/mana-app';

@singleton({ contrib: ColorContribution })
export class KernelPanelColorContribution implements ColorContribution {
  registerColors(colors: ColorRegistry): void {
    // common
    colors.register(
      // #region antd variable
      {
        id: 'libro.lab.kernel.panel.collapse.header.label',
        defaults: { dark: '#F8F8FB', light: Color.rgba(0, 10, 26, 0.68) },
        description: '',
      },
      {
        id: 'libro.lab.kernel.panel.collapse.item.text',
        defaults: { dark: '#E3E4E6', light: Color.rgba(0, 10, 26, 0.65) },
        description: '',
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
        id: 'libro.lab.welcome.service.info.background',
        defaults: {
          dark: Color.rgba(255, 255, 255, 0.08),
          light: Color.rgba(0, 10, 26, 0.02),
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
