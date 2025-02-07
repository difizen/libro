import type { ColorRegistry } from '@difizen/libro-common/app';
import { Color, ColorContribution } from '@difizen/libro-common/app';
import { singleton } from '@difizen/libro-common/app';

@singleton({ contrib: ColorContribution })
export class LibroTocColorRegistry implements ColorContribution {
  registerColors(colors: ColorRegistry): void {
    colors.register(
      // #region antd variable
      {
        id: 'libro.toc.title.color',
        defaults: { dark: '#EDEEEF', light: Color.rgba(0, 0, 0, 0.85) },
        description: '',
      },
      {
        id: 'libro.toc.text.color',
        defaults: { dark: '#E3E4E6', light: Color.rgba(0, 10, 26, 0.68) },
        description: '',
      },
      {
        id: 'libro.toc.hover.color',
        defaults: { dark: '#515359', light: Color.rgba(206, 211, 211, 0.422) },
        description: '',
      },
    );
  }
}
