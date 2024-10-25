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
    );
    colors.register(
      // #region antd variable
      {
        id: 'libro.ai.native.box.shadow',
        defaults: {
          dark: Color.rgba(203, 146, 197, 0.37),
          light: Color.rgba(203, 146, 197, 0.37),
        },
        description: '',
      },
    );
  }
}
