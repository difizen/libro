import {
  PlusOutlined,
  PlayCircleOutlined,
  CopyOutlined,
  ScissorOutlined,
  SnippetsOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  // ReloadOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';
import type { Command } from '@difizen/libro-common/app';
import { l10n } from '@difizen/libro-common/l10n';

import {
  Undo,
  Redo,
  Reload,
  ClearOutlined,
  MoveUpOutlined,
  MoveDownOutlined,
  DeleteOutlined,
  MoreOutlined,
  PauseCircleOutlined,
} from '../material-from-designer.js';

export const NotebookCommands: Record<
  string,
  Command & { keybind?: string | string[] | undefined; when?: string | undefined }
> = {
  //#region libro command
  ChangeCellTo: {
    id: 'notebook:change-cell-to',
  },

  Interrupt: {
    id: 'notebook:interrupt',
    label: `Interrupt`,
    icon: PauseCircleOutlined,
  },

  //#endregion

  //#region jupyterlab command
  ChangeCellToCode: {
    id: 'notebook:change-cell-to-code',
    label: `Change to Code Cell Type`,
    keybind: 'Y',
    when: 'commandMode',
  },
  ChangeCellToHeading1: {
    id: 'notebook:change-cell-to-heading-1',
    label: `Change to Heading 1`,
    keybind: '1',
    when: 'commandMode',
  },
  ChangeCellToHeading2: {
    id: 'notebook:change-cell-to-heading-2',
    label: `Change to Heading 1`,
    keybind: '2',
    when: 'commandMode',
  },
  ChangeCellToHeading3: {
    id: 'notebook:change-cell-to-heading-3',
    label: `Change to Heading 1`,
    keybind: '3',
    when: 'commandMode',
  },
  ChangeCellToHeading4: {
    id: 'notebook:change-cell-to-heading-4',
    label: `Change to Heading 1`,
    keybind: '4',
    when: 'commandMode',
  },
  ChangeCellToHeading5: {
    id: 'notebook:change-cell-to-heading-5',
    label: `Change to Heading 1`,
    keybind: '5',
    when: 'commandMode',
  },
  ChangeCellToHeading6: {
    id: 'notebook:change-cell-to-heading-6',
    label: `Change to Heading 1`,
    keybind: '6',
    when: 'commandMode',
  },
  ChangeCellToMarkdown: {
    id: 'notebook:change-cell-to-markdown',
    label: `Change to Markdown Cell Type`,
    keybind: 'M',
    when: 'commandMode',
  },
  ChangeCellToRaw: {
    id: 'notebook:change-cell-to-raw',
    label: `Change to Raw Cell Type`,
    keybind: 'R',
    when: 'commandMode',
  },
  ClearAllCellOutput: {
    id: 'notebook:clear-all-cell-outputs',
    label: `Clear Outputs of All Cells`,
    icon: ClearOutlined,
  },
  ClearCellOutput: {
    id: 'notebook:clear-cell-outputs',
    label: `Clear Cell Output`,
  },
  CloseAndShutdown: {
    id: 'notebook:close-and-shutdown',
    label: `Close Editor and Shut Down Kernel`,
    icon: PoweroffOutlined,
  },
  // TODO: 确定命令含义
  CollapseAllHeadings: {
    id: 'notebook:collapse-all-headings',
    label: `Collapse All Headings`,
    keybind: 'ctrlcmd+shift+left',
  },
  CopyCell: {
    id: 'notebook:copy-cell',
    label: `Copy Cells`,
    keybind: 'C',
    icon: CopyOutlined,
    when: 'commandMode',
  },
  // TODO: 确定命令含义
  CopyToClipboard: {
    id: 'notebook:copy-to-clipboard',
    label: `Copy Output to Clipboard`,
  },
  // TODO: 确定命令含义
  CreateOutputView: {
    id: 'notebook:create-output-view',
    label: `Create New View for Cell Output`,
  },
  CutCell: {
    id: 'notebook:cut-cell',
    label: `Cut Cells`,
    keybind: 'x',
    icon: ScissorOutlined,
    when: 'commandMode',
  },
  DeleteCell: {
    id: 'notebook:delete-cell',
    label: `Delete Cells`,
    icon: DeleteOutlined,
    keybind: 'D D',
    when: 'commandMode',
  },
  DeselectAll: {
    id: 'notebook:deselect-all',
    label: `Deselect All Cells`,
  },
  DisableOutputScrolling: {
    id: 'notebook:disable-output-scrolling',
    label: `Disable Scrolling for Outputs`,
  },
  DuplicateBelow: {
    id: 'notebook:duplicate-below',
    label: `Duplicate Cells Below`,
  },
  EnableOutputScrolling: {
    id: 'notebook:enable-output-scrolling',
    label: `Enable Scrolling for Outputs`,
  },
  EnableOrDisableAllOutputScrolling: {
    id: 'notebook:enable-or-disable-all-output-scrolling',
    label: `Enable Or Disable Scrolling for all Outputs`,
  },
  EnterCommandMode: {
    id: 'notebook:enter-command-mode',
    label: `Enter Command Mode`,
    keybind: 'esc',
  },
  EnterEditMode: {
    id: 'notebook:enter-edit-mode',
    label: `Enter Edit Mode`,
    keybind: 'enter',
    when: 'commandMode',
  },

  ExpandAllHeadings: {
    id: 'notebook:expand-all-headings',
    label: `Expand All Headings`,
    keybind: 'ctrlcmd+shift+right',
    when: 'commandMode',
  },

  ExportToFormat: {
    id: 'notebook:export-to-format',
    label: `Save and Export Notebook to the given format`,
  },

  ExtendMarkedCellsAbove: {
    id: 'notebook:extend-marked-cells-above',
    label: `Extend Selection Above`,
    keybind: ['shift+up', 'shift+K'],
    when: 'commandMode',
  },
  ExtendMarkedCellsBelow: {
    id: 'notebook:extend-marked-cells-below',
    label: `Extend Selection Below`,
    keybind: ['shift+down', 'shift+J'],
    when: 'commandMode',
  },
  //TODO:
  ExtendMarkedCellsBottom: {
    id: 'notebook:extend-marked-cells-bottom',
    label: `Extend Selection to Bottom`,
    keybind: 'shift+end',
    when: 'commandMode',
  },
  //TODO:
  ExtendMarkedCellsTop: {
    id: 'notebook:extend-marked-cells-top',
    label: `Extend Selection to Top`,
    keybind: 'shift+home',
    when: 'commandMode',
  },
  HideAllCell: {
    id: 'notebook:hide-all-cell',
  },
  HideAllCellCode: {
    id: 'notebook:hide-all-cell-code',
    label: `Collapse All Code`,
  },
  HideAllCellOutput: {
    id: 'notebook:hide-all-cell-output',
    label: `Collapse All Outputs`,
  },
  HideCellCode: {
    id: 'notebook:hide-cell-code',
    label: `Collapse Selected Code`,
  },
  HideOrShowCellCode: {
    id: 'notebook:hide-or-show-cell-code',
    label: `Hide or show Selected Code`,
    keybind: `ctrlcmd+'`,
  },
  HideCellOutputs: {
    id: 'notebook:hide-cell-outputs',
    label: `Collapse Selected Outputs`,
    icon: EyeInvisibleOutlined,
  },
  HideOrShowOutputs: {
    id: 'notebook:hide-or-show-outputs',
    label: `Hide or show Selected outputs`,
    keybind: 'ctrlcmd+o',
  },
  InsertCellAbove: {
    id: 'notebook:insert-cell-above',
    label: `Insert Cell Above`,
    keybind: 'A',
    when: 'commandMode',
  },
  InsertCellBelow: {
    id: 'notebook:insert-cell-below',
    label: `Insert Cell Below`,
    keybind: 'B',
    icon: PlusOutlined,
    when: 'commandMode',
  },
  InsertHeadingAbove: {
    id: 'notebook:insert-heading-above',
    label: `Insert Heading Above Current Heading`,
    keybind: 'shift+A',
    when: 'commandMode',
  },
  InsertHeadingBelow: {
    id: 'notebook:insert-heading-below',
    label: `Insert Heading Below Current Heading`,
    keybind: 'shift+B',
    when: 'commandMode',
  },
  MergeCellAbove: {
    id: 'notebook:merge-cell-above',
    label: `Merge Cell Above`,
    keybind: 'ctrlcmd+backspace',
    when: 'commandMode',
  },
  MergeCellBelow: {
    id: 'notebook:merge-cell-below',
    label: `Merge Cell Below`,
    keybind: 'ctrlcmd+shift+M',
    when: 'commandMode',
  },
  MergeCells: {
    id: 'notebook:merge-cells',
    label: `Merge Selected Cells`,
    keybind: 'shift+M',
    when: 'commandMode',
  },
  MoveCellDown: {
    id: 'notebook:move-cell-down',
    label: `Move Cells Down`,
    keybind: 'ctrlcmd+shift+down',
    icon: MoveDownOutlined,
    when: 'commandMode',
  },
  MoveCellUp: {
    id: 'notebook:move-cell-up',
    label: `Move Cells Up`,
    keybind: 'ctrlcmd+shift+up',
    icon: MoveUpOutlined,
    when: 'commandMode',
  },
  MoveCursorDown: {
    id: 'notebook:move-cursor-down',
    label: `Select Cell Below`,
    keybind: ['down', 'J'],
    when: 'commandMode',
  },
  MoveCursorUp: {
    id: 'notebook:move-cursor-up',
    label: `Select Cell Above`,
    keybind: ['up', 'K'],
    when: 'commandMode',
  },

  MoveCursorHeadingAboveOrCollapse: {
    id: 'notebook:move-cursor-heading-above-or-collapse',
    label: `Select Heading Above or Collapse Heading`,
    keybind: 'left',
    when: 'commandMode',
  },
  MoveCursorHeadingBelowOrExpand: {
    id: 'notebook:move-cursor-heading-below-or-expand',
    label: `Select Heading Below or Expand Heading`,
    keybind: 'right',
    when: 'commandMode',
  },
  PasteAndReplaceCell: {
    id: 'notebook:paste-and-replace-cell',
    label: `Paste Cells and Replace`,
  },
  PasteCellAbove: {
    id: 'notebook:paste-cell-above',
    label: `Paste Cells Above`,
  },
  PasteCellBelow: {
    id: 'notebook:paste-cell-below',
    label: `Paste Cells Below`,
    keybind: 'V',
    icon: SnippetsOutlined,
    when: 'commandMode',
  },
  Redo: {
    id: 'notebook:redo',
    label: `Redo`,
  },
  RedoCellAction: {
    id: 'notebook:redo-cell-action',
    label: `Redo Cell Operation`,
    icon: Redo,
    keybind: 'shift+Z',
    when: 'commandMode',
  },
  RenderAllMarkdown: {
    id: 'notebook:render-all-markdown',
    label: `Render All Markdown Cells`,
  },
  ReplaceSelection: {
    id: 'notebook:replace-selection',
    label: `Replace Selection in Notebook Cell`,
  },
  RestartAndRunToSelected: {
    id: 'notebook:restart-and-run-to-selected',
    label: l10n.t('Restart and Run up to Selected Cell'),
  },
  RestartClearOutput: {
    id: 'notebook:restart-clear-output',
    label: l10n.t('Restart and Clear Outputs of All Cells'),
    icon: Reload,
  },
  RestartRunAll: {
    id: 'notebook:restart-run-all',
    label: l10n.t('Restart and Run All Cells'),
  },
  RunAllAbove: {
    id: 'notebook:run-all-above',
    label: `Run All Above Selected Cell`,
  },
  RunAllBelow: {
    id: 'notebook:run-all-below',
    label: `Run All Below Selected Cell`,
  },
  RunAllCells: {
    id: 'notebook:run-all-cells',
    label: `Run All Cells`,
  },
  RunCell: {
    id: 'notebook:run-cell',
    icon: PlayCircleOutlined,
    // label: `Run Selected Cells and Don't Advance`,
    keybind: 'ctrlcmd+enter',
  },
  TopToolbarRunSelect: {
    id: 'notebook:top-toolbar-run-select',
  },
  SideToolbarRunSelect: {
    id: 'notebook:side-toolbar-run-select',
  },
  RunCellAndInsertBelow: {
    id: 'notebook:run-cell-and-insert-below',
    label: `Run Selected Cells and Insert Below`,
    keybind: 'alt+enter',
  },
  RunCellAndSelectNext: {
    id: 'notebook:run-cell-and-select-next',
    label: `Run Selected Cells and Select Below`,
    keybind: 'shift+enter',
  },
  // TODO: 确认是否保留
  RunInConsole: {
    id: 'notebook:run-in-console',
    label: `Run Selected Text or Current Line in Console`,
  },
  // TODO:
  SelectAll: {
    id: 'notebook:select-all',
    label: `Select All Cells`,
    keybind: 'ctrlcmd+A',
    when: 'commandMode',
  },
  SelectLastRunCell: {
    id: 'notebook:select-last-run-cell',
    label: `Select current running or last run cell`,
  },
  // TODO: 确认命令含义
  SetSideBySideRatio: {
    id: 'notebook:set-side-by-side-ratio',
    label: `Set Side by Side Ratio`,
  },
  ShowAllCell: {
    id: 'notebook:show-all-cell',
    label: `Expand All Cell`,
  },
  ShowAllCellCode: {
    id: 'notebook:show-all-cell-code',
    label: `Expand All Code`,
  },
  ShowAllCellOutputs: {
    id: 'notebook:show-all-cell-outputs',
    label: `Expand All Outputs`,
    icon: EyeOutlined,
  },
  ShowCellCode: {
    id: 'notebook:show-cell-code',
    label: `Expand Selected Code`,
  },
  ShowCellOutputs: {
    id: 'notebook:show-cell-outputs',
    label: `Expand Selected Outputs`,
  },
  SplitCellAntCursor: {
    id: 'notebook:split-cell-at-cursor',
    label: `Split Cell`,
    keybind: 'ctrlcmd+shift+-',
  },
  ToggleAllCellLineNumbers: {
    id: 'notebook:toggle-all-cell-line-numbers',
    label: `Show Line Numbers`,
    keybind: 'shift+L',
  },
  ToggleAutoclosingBrackets: {
    id: 'notebook:toggle-autoclosing-brackets',
    label: `Auto Close Brackets for All Notebook Cell Types`,
  },
  ToggleHeadingCollapse: {
    id: 'notebook:toggle-heading-collapse',
    label: `Toggle Collapse Notebook Heading`,
  },
  ToggleRenderSideBySideCurrent: {
    id: 'notebook:toggle-render-side-by-side-current',
    label: `Render Side-by-Side`,
    keybind: 'shift+R',
    when: 'commandMode',
  },
  Trust: {
    id: 'notebook:trust',
    label: `Trust Notebook`,
  },
  Undo: {
    id: 'notebook:undo',
    label: `Undo`,
  },
  UndoCellAction: {
    id: 'notebook:undo-cell-action',
    label: `Undo Cell Operation`,
    keybind: 'Z',
    icon: Undo,
    when: 'commandMode',
  },
  More: {
    id: 'notebook:more',
    icon: MoreOutlined,
  },
  InsertCellBottom: {
    id: 'notebook:insert-cell-bottom',
  },
  //#endregion
};
