import type { ColorRegistry } from '@difizen/mana-app';
import { Color, ColorContribution, singleton } from '@difizen/mana-app';

@singleton({ contrib: ColorContribution })
export class LibroSQLCellColorRegistry implements ColorContribution {
  registerColors(colors: ColorRegistry): void {
    colors.register(
      {
        id: 'libro.sql.tab',
        defaults: { dark: '#B2B2B3', light: Color.rgba(0, 10, 26, 0.68) },
        description: '',
      },
      {
        id: 'libro.sql.tab.background',
        defaults: { dark: '#1C1C1D', light: '#FAFAFB' },
        description: '',
      },
      {
        id: 'libro.sql.button.border',
        defaults: { dark: '#505559', light: Color.rgba(0, 10, 26, 0.1) },
        description: '',
      },
      {
        id: 'libro.sql.button.background',
        defaults: { dark: '#2F3032', light: '#FFFFFF' },
        description: '',
      },
      {
        id: 'libro.sql.button.text.color',
        defaults: { dark: '#BDC0C4', light: Color.rgba(0, 10, 26, 0.68) },
        description: '',
      },
    );
  }
}
