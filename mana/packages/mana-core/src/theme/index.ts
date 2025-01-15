import { ManaModule } from '../module';

import { AntdVariableContribution } from './basic/antd-variable-contribution';
import { DefaultVariableContribution } from './basic/default-variable-contribution';
import { VariableContribution } from './basic/variable-protocol';
import { VariableRegistry } from './basic/variable-registry';
import { AntdColorContribution } from './color/antd-color-contribution';
import { ColorContribution } from './color/color-protocol';
import { ColorRegistry } from './color/color-registry';
import { DefaultColorContribution } from './color/default-color-contribution';
import { ThemeApplication } from './theme-app';
import { ThemeService } from './theme-service';

export * from './basic';
export * from './color';
export * from './theme-service';
export * from './protocol';

export const ThemeModule = ManaModule.create().register({
  token: ThemeService,
  useDynamic: () => {
    return ThemeService.get();
  },
});

export const ThemeVariableModule = ManaModule.create()
  .contribution(VariableContribution, ColorContribution)
  .register(
    VariableRegistry,
    ColorRegistry,
    DefaultColorContribution,
    ThemeApplication,
    DefaultVariableContribution,
    AntdColorContribution,
    AntdVariableContribution,
  )
  .dependOn(ThemeModule);
