import { createViewPreference, ManaModule } from '@difizen/mana-app';
import {
  SettingEditorModule,
  SettingEditorView,
} from '@difizen/mana-configuration-panel';

import { WorkbenchLayoutArea } from '../workbench/layout/workbench-layout.js';

import { DefaultConfigurationContribution } from './default-configuration-contribution.js';

export const ConfigurtionMenuModule = ManaModule.create()
  .register(
    SettingEditorView,
    createViewPreference({
      view: SettingEditorView,
      slot: WorkbenchLayoutArea.main,
      autoCreate: true,
    }),
  )
  .register(DefaultConfigurationContribution)
  .dependOn(SettingEditorModule);
