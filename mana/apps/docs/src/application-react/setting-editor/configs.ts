import type { ConfigurationNode } from '@difizen/mana-app';
import { LocalConfigurationStorage } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';

export const FontSize: ConfigurationNode<number> = {
  id: 'libro.user.codeeditor.fontsize',
  description: l10n.t('代码编辑区域字体大小'),
  title: l10n.t('代码字号'),
  type: 'inputnumber',
  defaultValue: 13,
  schema: {
    type: 'number',
  },
};

export const LineHeight: ConfigurationNode<number> = {
  id: 'libro.user.codeeditor.lineheight',
  description: l10n.t('代码编辑区域字体行高'),
  title: l10n.t('代码行高'),
  type: 'inputnumber',
  defaultValue: 20,
  schema: {
    type: 'number',
  },
};

export const TabSize: ConfigurationNode<number> = {
  id: 'libro.user.codeeditor.tabsize',
  description: l10n.t('tab转换为几个空格大小'),
  title: l10n.t('tab大小'),
  type: 'inputnumber',
  defaultValue: 4,
  schema: {
    type: 'number',
  },
};

export const InsertSpaces: ConfigurationNode<boolean> = {
  id: 'libro.user.codeeditor.insertspaces',
  description: l10n.t('输入tab是否转换为空格'),
  title: l10n.t('tab转空格'),
  type: 'checkbox',
  defaultValue: true,
  schema: {
    type: 'boolean',
  },
};

export const LineWarp: ConfigurationNode<'wordWrapColumn' | 'off' | 'on' | 'bounded'> =
  {
    id: 'libro.user.codeeditor.linewarp',
    description: l10n.t(`自动换行策略:
  - "off", lines will never wrap.
  - "on", lines will wrap at the viewport border.
  - "wordWrapColumn", lines will wrap at 'wordWrapColumn'.
  - "bounded", lines will wrap at minimum between viewport width and wordWrapColumn.`),
    title: l10n.t('自动换行'),
    type: 'select',
    defaultValue: 'off',
    schema: {
      type: 'string',
      enum: ['off', 'on', 'wordWrapColumn', 'bounded'],
    },
  };

export const WordWrapColumn: ConfigurationNode<number> = {
  id: 'libro.user.codeeditor.wordWrapColumn',
  description: l10n.t('开启自动换行后，自动换行的列数'),
  title: l10n.t('自动换行列数'),
  type: 'inputnumber',
  defaultValue: 80,
  schema: {
    type: 'number',
  },
};

export const LSPEnabled: ConfigurationNode<boolean> = {
  id: 'libro.user.codeeditor.lspenabled',
  description: l10n.t(
    '开启语言服务后，编辑器能提供更多辅助编码能力，包括：自动提示、代码诊断、hover提示、格式化、代码跳转、重命名等等',
  ),
  title: l10n.t('开启语言服务'),
  type: 'checkbox',
  defaultValue: false,
  schema: {
    type: 'boolean',
  },
};

export const DemoStringConfig: ConfigurationNode<string> = {
  id: 'test.demostring',
  description: 'input string',
  title: 'input',
  type: 'input',
  defaultValue: 'this value stored in localstorage',
  schema: {
    type: 'string',
  },
  storage: LocalConfigurationStorage,
};

export const DemoNumberConfig: ConfigurationNode<number> = {
  id: 'test.demonumber',
  description: 'input a number',
  title: 'inputnumber',
  type: 'inputnumber',
  defaultValue: 5,
  schema: {
    type: 'integer',
    minimum: 0,
    maximum: 10,
  },
};

export const DemoBooleanConfig: ConfigurationNode<boolean> = {
  id: 'test.democheckbox',
  description: 'select checkbox',
  title: 'checkbox',
  type: 'checkbox',
  defaultValue: false,
  schema: {
    type: 'boolean',
  },
};

export const mockOptions = ['banana', 'grapes', 'orange'];

export const DemoSelectConfig: ConfigurationNode<string> = {
  id: 'test.demoselect',
  description: 'select an option',
  title: 'select',
  type: 'select',
  defaultValue: 'banana',
  schema: {
    type: 'string',
    enum: mockOptions,
  },
};

export const DemoSwitchConfig: ConfigurationNode<boolean> = {
  id: 'test.demoswitch',
  description: 'switch it',
  title: 'switch',
  type: 'switch',
  defaultValue: false,
  schema: {
    type: 'boolean',
  },
};

export const DemoDateConfig: ConfigurationNode<string> = {
  id: 'test.datepicker',
  description: 'select date',
  title: 'datepicker',
  type: 'datepicker',
  defaultValue: '2022/10/1',
  schema: {
    type: 'string',
  },
};
