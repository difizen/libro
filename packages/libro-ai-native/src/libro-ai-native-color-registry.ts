import type { ColorRegistry } from '@difizen/mana-app';
import { singleton, ColorContribution } from '@difizen/mana-app';

@singleton({ contrib: ColorContribution })
export class LibroAINativeColorRegistry implements ColorContribution {
  registerColors(colors: ColorRegistry): void {
    colors.register(
      // #region antd variable
      {
        id: 'libro.ai.native.border',
        defaults: { dark: '#bd74e8', light: '#bd74e8' },
        description: '',
      },
    );
  }
}
