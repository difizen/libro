import { ManaModule, ConfigurationModule } from '@difizen/mana-app';

import { ConfigurationPanelView } from './configuration-panel-view.js';
import { DefaultConfigurationRenderContribution } from './configuration-render-contribution.js';
import { SettingEditorView } from './setting-editor-view.js';
import { SettingTreeService } from './setting-tree-service.js';
import { SettingTreeView } from './setting-tree-view.js';

export const SettingEditorModule = ManaModule.create()
  .register(
    SettingEditorView,
    DefaultConfigurationRenderContribution,
    ConfigurationPanelView,
    SettingTreeView,
    SettingTreeService,
  )
  .dependOn(ConfigurationModule);
