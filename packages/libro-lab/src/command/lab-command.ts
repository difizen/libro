import { l10n } from '@difizen/mana-l10n';

export const LabCommands = {
  About: {
    id: 'libro-lab-header-menu-help-about',
    label: l10n.t('关于'),
  },
  // OpenTerminal: {
  //   id: 'libro-lab-header-menu-terminal-open',
  //   label: '新建终端',
  // },
  Save: {
    id: 'libro-lab-save',
    label: l10n.t('保存'),
    keybind: 'ctrlcmd+s',
  },
  CreateFile: {
    id: 'libro-lab-header-menu-file-create',
    label: l10n.t('新建文件'),
  },
  RedoCellAction: {
    id: 'libro-lab-header-menu-edit-redo-cell-action',
    label: l10n.t('恢复单元格操作'),
  },
  UndoCellAction: {
    id: 'libro-lab-header-menu-edit-undo-cell-action',
    label: l10n.t('撤销单元格操作'),
  },
  CutCell: {
    id: 'libro-lab-header-menu-edit-cut-cell',
    label: l10n.t('剪切单元格'),
  },
  CopyCell: {
    id: 'libro-lab-header-menu-edit-copy-cell',
    label: l10n.t('复制单元格'),
  },
  PasteCellAbove: {
    id: 'libro-lab-header-menu-edit-paste-cell-above',
    label: l10n.t('在上方粘贴单元格'),
  },
  PasteCellBelow: {
    id: 'libro-lab-header-menu-edit-paste-cell-below',
    label: l10n.t('在下方粘贴单元格'),
  },
  PasteAndReplaceCell: {
    id: 'libro-lab-header-menu-edit-paste-and-replace-cell',
    label: l10n.t('粘贴单元格并替换'),
  },
  DeleteCell: {
    id: 'libro-lab-header-menu-edit-delete-cell',
    label: l10n.t('删除单元格'),
  },
  SelectAll: {
    id: 'libro-lab-header-menu-edit-select-all',
    label: l10n.t('选择所有单元格'),
  },
  DeselectAll: {
    id: 'libro-lab-header-menu-edit-deselect-all',
    label: l10n.t('取消选择所有单元格'),
  },
  MoveCellUp: {
    id: 'libro-lab-header-menu-edit-move-cell-up',
    label: l10n.t('上移单元格'),
  },
  MoveCellDown: {
    id: 'libro-lab-header-menu-edit-move-cell-down',
    label: l10n.t('下移单元格'),
  },
  SplitCellAntCursor: {
    id: 'libro-lab-header-menu-edit-split-cell-at-cursor',
    label: l10n.t('切分单元格'),
  },
  MergeCellAbove: {
    id: 'libro-lab-header-menu-edit-merge-cell-above',
    label: l10n.t('合并上方单元格'),
  },
  MergeCellBelow: {
    id: 'libro-lab-header-menu-edit-merge-cell-below',
    label: l10n.t('合并下方单元格'),
  },
  MergeCells: {
    id: 'libro-lab-header-menu-edit-merge-cells',
    label: l10n.t('合并选中单元格'),
  },
  ClearCellOutput: {
    id: 'libro-lab-header-menu-edit-clear-cell-outputs',
    label: l10n.t('清空输出'),
  },
  ClearAllCellOutput: {
    id: 'libro-lab-header-menu-edit-clear-all-cell-outputs',
    label: l10n.t('清空所有输出'),
  },
  HideOrShowCellCode: {
    id: 'libro-lab-header-menu-view-hide-or-show-cell-code',
    label: l10n.t('隐藏/显示所选单元格代码'),
  },
  HideOrShowOutputs: {
    id: 'libro-lab-header-menu-view-hide-or-show-outputs',
    label: l10n.t('隐藏/显示所选单元格输出'),
  },
  EnableOutputScrolling: {
    id: 'libro-lab-header-menu-view-enable-output-scrolling',
    label: l10n.t('固定输出高度'),
  },
  DisableOutputScrolling: {
    id: 'libro-lab-header-menu-view-disable-output-scrolling',
    label: l10n.t('取消固定输出高度'),
  },
  RestartAndRunToSelected: {
    id: 'libro-lab-header-menu-run-restart-and-run-to-selected',
    label: l10n.t('重启并执行至选中单元格'),
  },
  RestartRunAll: {
    id: 'libro-lab-header-menu-run-restart-run-all',
    label: l10n.t('重启并执行全部单元格'),
  },
  RunAllAbove: {
    id: 'libro-lab-header-menu-run-all-above',
    label: l10n.t('执行上方所有单元格'),
  },
  RunAllBelow: {
    id: 'libro-lab-header-menu-run-all-below',
    label: l10n.t('执行下方所有单元格'),
  },
  RunAllCells: {
    id: 'libro-lab-header-menu-run-all-cells',
    label: l10n.t('执行全部单元格'),
  },
  RunCell: {
    id: 'libro-lab-header-menu-run-cell',
    label: l10n.t('执行选中单元格'),
  },
  RunCellAndInsertBelow: {
    id: 'libro-lab-header-menu-run-cell-and-insert-below',
    label: l10n.t('执行选中并向下插入一个单元格'),
  },
  RunCellAndSelectNext: {
    id: 'libro-lab-header-menu-run-cell-and-select-next',
    label: l10n.t('执行并选中下一个单元格'),
  },
  ToggleBottom: {
    id: 'libro-lab-toggle-bottom',
    label: l10n.t('切换底部面板'),
  },
};
