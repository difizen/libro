import type { ColorRegistry } from '@difizen/mana-app';
import { Color } from '@difizen/mana-app';
import { singleton, ColorContribution } from '@difizen/mana-app';

@singleton({ contrib: ColorContribution })
export class LibroAINativeColorRegistry implements ColorContribution {
  registerColors(colors: ColorRegistry): void {
    colors.register(
      // #region antd variable
      {
        id: 'libro.ai.native.color',
        defaults: { dark: '#bd74e8', light: '#bd74e8' },
        description: '',
      },
      {
        id: 'libro.ai.native.box.shadow',
        defaults: {
          dark: Color.rgba(203, 146, 197, 0.37),
          light: Color.rgba(203, 146, 197, 0.37),
        },
        description: '',
      },
      {
        id: 'libro.ai.native.btn.hover.color',
        defaults: {
          dark: Color.rgba(255, 255, 255, 0.2),
          light: Color.rgba(0, 10, 26, 0.16),
        },
        description: '',
      },
    );
  }
}
