import { LibroLabLayoutSlots } from '@difizen/libro-lab';
import { createViewPreference, ManaModule } from '@difizen/mana-app';
import {
  SettingEditorModule,
  SettingEditorView,
} from '@difizen/mana-configuration-panel';

import { DefaultConfigurationContribution } from './default-configuration-contribution.js';
import { SettingModalContribution } from './setting-contribution.js';
import { SettingsService } from './setting-service.js';
import { SettingView } from './setting-view.js';

export const SettingModule = ManaModule.create()
  .register(SettingModalContribution, SettingsService)
  .register(
    SettingEditorView,
    createViewPreference({
      view: SettingEditorView,
      slot: LibroLabLayoutSlots.content,
      autoCreate: true,
      openOptions: {
        reveal: true,
        order: '1',
      },
    }),

    SettingView,
    createViewPreference({
      view: SettingView,
      slot: LibroLabLayoutSlots.content,
      autoCreate: true,
      openOptions: {
        reveal: true,
        order: '2',
      },
    }),
  )
  .register(DefaultConfigurationContribution)
  .dependOn(SettingEditorModule);
