import { ManaModule } from '@difizen/libro-common/mana-app';

import { SettingEditorModule } from './setting-editor/index.js';
import { SettingsContribution } from './settings-contribution.js';

export const SettingsModule = ManaModule.create()
  .register(SettingsContribution)
  .dependOn(SettingEditorModule);
