import type { ConfigurationNode } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';

export const HeaderToolbarVisible: ConfigurationNode<boolean> = {
  id: 'libro.header.toolbar',
  description: l10n.t('是否显示libro顶部工具栏'),
  title: l10n.t('顶部工具栏'),
  type: 'checkbox',
  defaultValue: true,
  schema: {
    type: 'boolean',
  },
};

export const CellTopToolbarSetting: ConfigurationNode<boolean> = {
  id: 'libro.cell.top-toolbar',
  description: l10n.t('是否显示cell顶部工具栏'),
  title: l10n.t('cell顶部工具栏'),
  type: 'checkbox',
  defaultValue: true,
  schema: {
    type: 'boolean',
  },
};

export const CellSideToolbarVisible: ConfigurationNode<boolean> = {
  id: 'libro.cell.side-toolbar',
  description: l10n.t('是否显示cell侧边工具栏'),
  title: l10n.t('cell侧边工具栏'),
  type: 'checkbox',
  defaultValue: true,
  schema: {
    type: 'boolean',
  },
};

export const AutoInsertWhenNoCell: ConfigurationNode<boolean> = {
  id: 'libro.command.insert-cell-below',
  description: l10n.t('没有cell时是否默认创建cell'),
  title: l10n.t('默认创建cell'),
  type: 'checkbox',
  defaultValue: true,
  schema: {
    type: 'boolean',
  },
};

export const EnterEditModeWhenAddCell: ConfigurationNode<boolean> = {
  id: 'libro.command.enter-edit-mode-when-add-cell',
  description: l10n.t('增加cell操作默认进入编辑态'),
  title: l10n.t('默认进入编辑态'),
  type: 'checkbox',
  defaultValue: true,
  schema: {
    type: 'boolean',
  },
};
export const CollapserActive: ConfigurationNode<boolean> = {
  id: 'libro.command.collapser-active',
  description: l10n.t('点击左侧长条是否可以隐藏与显示cell'),
  title: l10n.t('默认点击长条可以隐藏与显示cell'),
  type: 'checkbox',
  defaultValue: true,
  schema: {
    type: 'boolean',
  },
};
export const MultiSelectionWhenShiftClick: ConfigurationNode<boolean> = {
  id: 'libro.command.multiselection-when-shift-click',
  description: l10n.t('按住shift键并点击拖拽区域可以进行多选'),
  title: l10n.t('默认按住shift键并点击拖拽区域可以进行多选'),
  type: 'checkbox',
  defaultValue: true,
  schema: {
    type: 'boolean',
  },
};

export const RightContentFixed: ConfigurationNode<boolean> = {
  id: 'libro.right.content.fixed',
  description: l10n.t('libroview的右边栏是否相对固定'),
  title: l10n.t('右侧内容是否相对固定'),
  type: 'checkbox',
  defaultValue: false,
  schema: {
    type: 'boolean',
  },
};
