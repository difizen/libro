import { ApplicationModule } from './application';
import { CommandModule } from './command';
import { CommonModule } from './common';
import { ConfigurationModule } from './configuration';
import { ContextModule } from './context';
import { KeybindModule } from './keybinding';
import { CoreMenuModule } from './menu';
import { ManaModule } from './module';
import { SelectionModule } from './selection';
import { ThemeVariableModule } from './theme';
import { CoreToolbarModule } from './toolbar';
import { ViewModule } from './view';

export * from './components';
export * from './application';
export * from './browser';
export * from './command';
export * from './menu';
export * from './common';
export * from './context';
export * from './module';
export * from './view';
export * from './selection';
export * from './theme';
export * from './toolbar';
export * from './keybinding';
export * from './keyboard';
export * from './configuration';
export * from './utils';

export const ManaPreset = ManaModule.create().dependOn(
  CommonModule,
  ApplicationModule,
  ContextModule,
  CommandModule,
  CoreMenuModule,
  CoreToolbarModule,
  SelectionModule,
  ThemeVariableModule,
  ViewModule,
  KeybindModule,
  ConfigurationModule,
);

export const ManaModules = {
  Common: CommonModule,
  Application: ApplicationModule,
  Command: CommandModule,
  Menu: CoreMenuModule,
  View: ViewModule,
  Selection: SelectionModule,
  Toolbar: CoreToolbarModule,
  ThemeVariable: ThemeVariableModule,
  Context: ContextModule,
  Keybind: KeybindModule,
  Configuration: ConfigurationModule,
};
