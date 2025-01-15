import { MacCommandOutlined } from '@ant-design/icons';
import {
  BaseView,
  ConfigurationRegistry,
  inject,
  prop,
  singleton,
  useInject,
  view,
  ViewInstance,
  ViewManager,
} from '@difizen/mana-app';
import { SplitPanel } from '@difizen/mana-react';
import React from 'react';

import { ConfigurationPanelView } from './configuration-panel-view';

export const SettingEditorComponent: React.FC = () => {
  const viewInstance = useInject<SettingEditorView>(ViewInstance);
  const PanelView = viewInstance.configurationPanel?.view;

  return (
    <SplitPanel id="">
      <SplitPanel.Pane id="" flex={1}>
        {PanelView && <PanelView />}
      </SplitPanel.Pane>
    </SplitPanel>
  );
};

@singleton()
@view('SettingEditorView')
export class SettingEditorView extends BaseView {
  override view = SettingEditorComponent;

  protected readonly configurationRegistry: ConfigurationRegistry;
  protected readonly viewManager: ViewManager;

  constructor(
    @inject(ConfigurationRegistry) configurationRegistry: ConfigurationRegistry,
    @inject(ViewManager) viewManager: ViewManager,
  ) {
    super();
    this.configurationRegistry = configurationRegistry;
    this.viewManager = viewManager;
    this.title.icon = MacCommandOutlined;
    this.title.label = 'SettingEditor';
    this.id = 'setting-editor-menu';
  }

  @prop()
  configurationPanel?: ConfigurationPanelView;

  override async onViewMount() {
    await this.initPanel();
  }

  async initPanel() {
    const namespace = this.configurationRegistry.getRootNamespaces().at(0);
    if (namespace) {
      this.configurationPanel =
        await this.viewManager.getOrCreateView<ConfigurationPanelView>(
          ConfigurationPanelView,
        );
      this.configurationPanel.configurationNodes =
        this.configurationRegistry.getConfigurationByNamespace([namespace], false);
    }
  }
}
