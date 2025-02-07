import type { ColorRegistry } from '@difizen/libro-common/app';
import { Color, ColorContribution } from '@difizen/libro-common/app';
import { singleton } from '@difizen/libro-common/app';

@singleton({ contrib: ColorContribution })
export class FileColorContribution implements ColorContribution {
  registerColors(colors: ColorRegistry): void {
    // common
    colors.register(
      // #region antd variable
      {
        id: 'libro.file.label.text',
        defaults: { dark: '#F8F8FB', light: Color.rgba(0, 0, 0, 0.85) },
        description: '',
      },
      {
        id: 'libro.file.text',
        defaults: { dark: '#E3E4E6', light: Color.rgba(0, 0, 0, 0.65) },
        description: '',
      },
      {
        id: 'libro.file.type.border',
        defaults: { dark: '#3B3C42', light: Color.rgba(0, 10, 26, 0.1) },
        description: '',
      },
    );
  }
}
