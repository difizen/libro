import { ConfigurationModule, ManaModule } from '@difizen/mana-app';

import { ConfigurationPanelView } from './configuration-panel-view.js';
import { DefaultConfigurationRenderContribution } from './configuration-render-contribution.js';
import { SettingEditorView } from './setting-editor-view.js';

export const SettingEditorModule = ManaModule.create()
  .register(
    SettingEditorView,
    DefaultConfigurationRenderContribution,
    ConfigurationPanelView,
  )
  .dependOn(ConfigurationModule);
