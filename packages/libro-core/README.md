# libro-core

## Token/API

### LibroService

LibroService 管理 libro 实例，libro view 创建、活跃 libro view 的监听等能力。

```typescript
// 组件内引入
const service = useInject(LibroService);

// 属性引入
@inject(LibroService) service:LibroService;

// 事件监听
service.getOrCreateView(options);
service.onActiveChanged(callback);
service.onFocusChanged(callback);
service.onNotebookViewCreated(callback);
```

## 扩展点

### 单元格扩展

使用单元格扩展可以增加自定义的单元格类型，内置的单元格类型也均基于该扩展定义实现。

单元格定义分为 model 和 view 两部分，model 定义单元格的数据结构，view 定义单元格的渲染方式和提供交互能力。每种单元格都需要对创建时接收到的参数返回优先级，按照最高优先级的单元格类型创建单元格。

```typescript
export interface CellModelContribution {
  cellMeta: CellMeta;
  canHandle: (options: CellOptions, libroType?: string) => number;
  createModel: (options: CellOptions) => MaybePromise<CellModel>;
  getDefaultCellOption?: () => CellOptions;
}
export interface CellViewContribution {
  canHandle: (options: CellOptions) => number;
  view: Newable<CellView>;
}
```

### 输出扩展

使用输出扩展可以增加自定义的输出类型，内置的输出类型也均基于该扩展定义实现。在 jupyter 场景下，用户一般不需要增加输出类型的扩展，而仅需要增加 mime 渲染器，mime 渲染器扩展由 output 实现。

```typescript
export interface OutputContribution {
  canHandle: (output: IOutput) => number;
  factory: OutputModelFactory;
}
```

### 内容加载扩展

用户有时候从自定义存储中读取 notebook 数据，可以通过内容加载扩展来实现，这里要求用户的返回数据符合 notebook 的数据结构。

```typescript
export interface ContentContribution {
  canHandle: (options: Record<string, any>, model: any) => number;
  loadContent: (options: Record<string, any>, model: any) => Promise<INotebookContent>;
}
```

### 视图插槽

如果希望在编辑器内部增加一些自定义的渲染像，除了可以覆盖内置的渲染器外，还可以通过视图插槽的方式来实现。

内置插槽位置如下：

- container
- content
- list
- right

```typescript
export interface LibroExtensionSlotContribution {
  factory: LibroExtensionSlotFactory;
  slot: LibroSlot;
  viewOpenOption?: {
    order?: string;
    reveal?: boolean;
  };
}
```

## 命令 & 快捷键

### 文档命令

| 命令               | 快捷键      | 命令模式 | 说明     |
| ------------------ | ----------- | -------- | -------- |
| `document:save`    | `ctrlcmd+s` |          | 保存文档 |
| `document:setting` |             |          | 打开配置 |

### kernel 命令

| 命令                           | 快捷键 | 命令模式 | 说明                |
| ------------------------------ | ------ | -------- | ------------------- |
| `notebook:change-kernel`       |        |          | Change Kernel       |
| `notebook:get-kernel`          |        |          | Get Kernel          |
| `notebook:interrupt-kernel`    |        |          | Interrupt Kernel    |
| `notebook:reconnect-to-kernel` |        |          | Reconnect to Kernel |
| `notebook:restart-kernel`      |        |          | Restart Kernel      |
| `notebook:shutdown-kernel`     |        |          | Shutdown Kernel     |

### notebook 命令

| 命令                                             | 快捷键                 | 命令模式 | 说明                                            |
| ------------------------------------------------ | ---------------------- | -------- | ----------------------------------------------- |
| `notebook:interrupt`                             |                        |          | Interrupt                                       |
| `notebook:change-cell-to`                        |                        |          |                                                 |
| `notebook:change-cell-to-code`                   | `Y`                    | &#10003; | Change to Code Cell Type                        |
| `notebook:change-cell-to-heading-1`              | `1`                    | &#10003; | Change to Heading 1                             |
| `notebook:change-cell-to-heading-2`              | `2`                    | &#10003; | Change to Heading 2                             |
| `notebook:change-cell-to-heading-3`              | `3`                    | &#10003; | Change to Heading 3                             |
| `notebook:change-cell-to-heading-4`              | `4`                    | &#10003; | Change to Heading 4                             |
| `notebook:change-cell-to-heading-5`              | `5`                    | &#10003; | Change to Heading 5                             |
| `notebook:change-cell-to-heading-6`              | `6`                    | &#10003; | Change to Heading 6                             |
| `notebook:change-cell-to-markdown`               | `M`                    | &#10003; | Change to Markdown Cell Type                    |
| `notebook:change-cell-to-raw`                    | `R`                    | &#10003; | Change to Raw Cell Type                         |
| `notebook:clear-all-cell-outputs`                |                        |          | Clear Outputs of All Cells                      |
| `notebook:clear-cell-outputs`                    |                        |          | Clear Cell Output                               |
| `notebook:close-and-shutdown`                    |                        |          | Close editor and shut down kernel               |
| `notebook:collapse-all-headings`                 | `ctrlcmd+shift+left`   |          | Collapse All Headings                           |
| `notebook:copy-cell`                             | `C`                    | &#10003; | Copy Cells                                      |
| `notebook:cut-cell`                              | `X`                    | &#10003; | Cut Cells                                       |
| `notebook:delete-cell`                           | `D D`                  | &#10003; | Delete Cells                                    |
| `notebook:deselect-all`                          |                        |          | Deselect All Cells                              |
| `notebook:disable-output-scrolling`              |                        |          | Disable Scrolling for Outputs                   |
| `notebook:duplicate-below`                       |                        |          | Duplicate Cells Below                           |
| `notebook:enable-output-scrolling`               |                        |          | Enable Scrolling for Outputs                    |
| `notebook:enter-command-mode`                    | `esc`                  |          | Enter Command Mode                              |
| `notebook:enter-edit-mode`                       | `enter`                |          | Enter Edit Mode                                 |
| `notebook:expand-all-headings`                   | `ctrlcmd+shift+right`  |          | Expand All Headings                             |
| `notebook:export-to-format`                      |                        |          | Save and Export Notebook to the given format    |
| `notebook:extend-marked-cells-above`             | `shift+up` `shift+K`   |          | Extend Selection Above                          |
| `notebook:extend-marked-cells-below`             | `shift+down` `shift+J` |          | Extend Selection Below                          |
| `notebook:extend-marked-cells-bottom`            | `shift+end`            |          | Extend Selection to Bottom                      |
| `notebook:extend-marked-cells-top`               | `shift+home`           |          | Extend Selection to Top                         |
| `notebook:hide-all-cell`                         |                        |          |                                                 |
| `notebook:hide-all-cell-code`                    |                        |          | Collapse All Code                               |
| `notebook:hide-all-cell-output`                  |                        |          | Collapse All Outputs                            |
| `notebook:hide-cell-code`                        |                        |          | Collapse Selected Code                          |
| `notebook:hide-or-show-cell-code`                | `ctrlcmd+'`            |          | Hide or show Selected Code                      |
| `notebook:hide-cell-outputs`                     |                        |          | Collapse Selected Outputs                       |
| `notebook:hide-or-show-outputs`                  | `ctrlcmd+o`            |          | Hide or show Selected outputs                   |
| `notebook:insert-cell-above`                     | `A`                    | &#10003; | Insert Cell Above                               |
| `notebook:insert-cell-below`                     | `B`                    | &#10003; | Insert Cell Below                               |
| `notebook:insert-heading-above`                  | `shift+A`              | &#10003; | Insert Heading Above Current Heading            |
| `notebook:insert-heading-below`                  | `shift+B`              | &#10003; | Insert Heading Below Current Heading            |
| `notebook:merge-cell-above`                      | `ctrlcmd+backspace`    | &#10003; | Merge Cell Above                                |
| `notebook:merge-cell-below`                      | `ctrlcmd+shift+M`      | &#10003; | Merge Cell Below                                |
| `notebook:merge-cells`                           | `shift+M`              | &#10003; | Merge Selected Cells                            |
| `notebook:move-cell-down`                        | `ctrlcmd+shift+down`   | &#10003; | Move Cells Down                                 |
| `notebook:move-cell-up`                          | `ctrlcmd+shift+up`     | &#10003; | Move Cells Up                                   |
| `notebook:move-cursor-down`                      | `down` `J`             | &#10003; | Select Cell Below                               |
| `notebook:move-cursor-up`                        | `up` `K`               | &#10003; | Select Cell Up                                  |
| `notebook:move-cursor-heading-above-or-collapse` | `left`                 | &#10003; | Select Heading Above or Collapse Heading        |
| `notebook:move-cursor-heading-below-or-expand`   | `right`                | &#10003; | Select Heading Below or Collapse Heading        |
| `notebook:paste-and-replace-cell`                |                        |          | Paste Cells and Replace                         |
| `notebook:paste-cell-above`                      |                        |          | Paste Cells Above                               |
| `notebook:paste-cell-below`                      | `V`                    | &#10003; | Paste Cells Below                               |
| `notebook:redo`                                  |                        |          | Redo                                            |
| `notebook:redo-cell-action`                      | `shift+Z`              | &#10003; | Redo Cell Operation                             |
| `notebook:render-all-markdown`                   |                        |          | Render All Markdown Cells                       |
| `notebook:replace-selection`                     |                        |          | Replace Selection in Notebook Cell              |
| `notebook:restart-and-run-to-selected`           |                        |          | Restart and Run up to Selected Cell             |
| `notebook:restart-clear-output`                  |                        |          | Restart and Clear Outputs of All Cells          |
| `notebook:restart-run-all`                       |                        |          | Restart and Run All Cells                       |
| `notebook:run-all-above`                         |                        |          | Run All Above Selected Cell                     |
| `notebook:run-all-below`                         |                        |          | Run All Below Selected Cell                     |
| `notebook:run-all-cells`                         |                        |          | Run All Cells                                   |
| `notebook:run-cell`                              | `ctrlcmd+enter`        |          | Run Selected Cells and Don't Advance            |
| `notebook:run-cell-and-insert-below`             | `alt+enter`            |          | Run Selected Cells and Insert Below             |
| `notebook:run-cell-and-select-next`              | `shift+enter`          |          | Run Selected Cells and Select Below             |
| `notebook:run-in-console`                        |                        |          | Run Selected Text or Current Line in Console    |
| `notebook:select-all`                            | `ctrlcmd+A`            | &#10003; | Select All Cells                                |
| `notebook:select-last-run-cell`                  |                        |          | Select current running or last run cell         |
| `notebook:set-side-by-side-ratio`                |                        |          | Set Side by Side Ratio                          |
| `notebook:show-all-cell`                         |                        |          | Expand All Cell                                 |
| `notebook:show-all-cell-code`                    |                        |          | Expand All Code                                 |
| `notebook:show-all-cell-outputs`                 |                        |          | Expand All Outputs                              |
| `notebook:show-cell-code`                        |                        |          | Expand Selected Code                            |
| `notebook:show-cell-outputs`                     |                        |          | Expand Selected Outputs                         |
| `notebook:split-cell-at-cursor`                  | `ctrlcmd+shift+-`      |          | Split Cell                                      |
| `notebook:toggle-all-cell-line-numbers`          | `shift+L`              |          | Show Line Numbers                               |
| `notebook:toggle-autoclosing-brackets`           |                        |          | Auto Close Brackets for All Notebook Cell Types |
| `notebook:toggle-heading-collapse`               |                        |          | Toggle Collapse Notebook Heading                |
| `notebook:toggle-render-side-by-side-current`    | `shift+R`              | &#10003; | Render Side-by-Side                             |
| `notebook:trust`                                 |                        |          | Trust Notebook                                  |
| `notebook:undo`                                  |                        |          | Undo                                            |
| `notebook:undo-cell-action`                      | `Z`                    | &#10003; | Undo Cell Operation                             |
| `notebook:insert-cell-bottom`                    |                        |          |                                                 |

## 配置 & 主题

libro 内置了一些配置项和主题设置，用户可以是用 mana 的配置模块和主题模块来消费或变更。

| 配置项                                          | 说明                                    | 默认值  |
| ----------------------------------------------- | --------------------------------------- | ------- |
| `libro.header.toolbar`                          | 是否显示 libro 顶部工具栏               | `true`  |
| `libro.cell.top-toolbar`                        | 是否显示单元格顶部工具栏                | `true`  |
| `libro.cell.side-toolbar`                       | 是否显示单元格侧边工具栏                | `true`  |
| `libro.command.insert-cell-below`               | 没有单元格时是否默认创建单元格          | `true`  |
| `libro.command.enter-edit-mode-when-add-cell`   | 增加单元格操作默认进入编辑态            | `true`  |
| `libro.command.collapser-active`                | 点击左侧长条是否可以隐藏与显示单元格    | `true`  |
| `libro.command.multiselection-when-shift-click` | 按住 shift 键并点击拖拽区域可以进行多选 | `true`  |
| `libro.right.content.fixed`                     | libro view 的右边栏是否相对固定         | `false` |

| 颜色                                         | css 变量 | 暗色主题    | 亮色主题    | 高对比主题 | 说明 |
| -------------------------------------------- | -------- | ----------- | ----------- | ---------- | ---- |
| `libro.warning.background`                   |          | `#A9611466` | `#FFFBE6`   |            |      |
| `libro.drag.hover.line.color`                |          | `#467DB0`   | `#BFE0FF`   |            |      |
| `libro.background`                           |          | `#1F2022`   | `#FFFFFF`   |            |      |
| `libro.popover.background.color`             |          | `#2F3032`   | `#FFFFFF`   |            |      |
| `libro.menu.hover.color`                     |          | `#515359`   | `#EBF6FF`   |            |      |
| `libro.dropdown.icon.color`                  |          | `#FFFFFF4D` | `#00000033` |            |      |
| `libro.input.background`                     |          | `#19191B`   | `#F4F6FB`   |            |      |
| `libro.text.default.color`                   |          | `#E3E4E6`   | `#000000`   |            |      |
| `libro.text.tertiary.color`                  |          | `#BDC0C4`   | `#B8BABA`   |            |      |
| `libro.output.background`                    |          | `#292A2D`   | `#FFFFFF`   |            |      |
| `libro.toptoolbar.border.color`              |          | `#FFFFFF1A` | `#0000001A` |            |      |
| `libro.toptoolbar.icon.color`                |          | `#BFBFBF`   | `#7B7B7B`   |            |      |
| `libro.toptoolbar.disabled.icon.color`       |          | `#FFFFFF4D` | `#00000040` |            |      |
| `libro.toptoolbar.text.color`                |          | `#F5F5F5`   | `#000000`   |            |      |
| `libro.bottom.btn.background.color`          |          | `#FFFFFF0A` | `#FFFFFF`   |            |      |
| `libro.bottom.btn.border.color`              |          | `#505559`   | `#000A1A29` |            |      |
| `libro.bottom.btn.icon.color`                |          | `#505559`   | `#525964D9` |            |      |
| `libro.bottom.btn.text.color`                |          | `#E3E4E6`   | `#000A1AAD` |            |      |
| `libro.default.btn.background.color`         |          | `#FFFFFF1A` | `#FFFFFF`   |            |      |
| `libro.default.btn.text.color`               |          | `#E3E4E6`   | `#000A1AAD` |            |      |
| `libro.primary.btn.background.color`         |          | `#2A97FD`   | `#1890FF`   |            |      |
| `libro.default.btn.border.color`             |          | `#BDC0C4`   | `#D6D8DA`   |            |      |
| `libro.toolbar.menu.label.color`             |          | `#BDC0C4`   | `#000000A6` |            |      |
| `libro.toolbar.menu.disabled.label.color`    |          | `#878C93`   | `#00000040` |            |      |
| `libro.toolbar.menu.keybind.color`           |          | `#878C93`   | `#00000073` |            |      |
| `libro.sidetoolbar.icon.color`               |          | `#BFBFBF`   | `#6982A9`   |            |      |
| `libro.sidetoolbar.border.color`             |          | `#FFFFFF14` | `#0000001A` |            |      |
| `libro.close.color`                          |          | `#FFFFFF73` | `#00000073` |            |      |
| `libro.modal.title.color`                    |          | `#EDEEEF`   | `#000000D9` |            |      |
| `libro.modal.content.color`                  |          | `#E3E4E6`   | `#000A1A`   |            |      |
| `libro.btn.primary.background.color`         |          | `#2A97FD`   | `#1890FF`   |            |      |
| `libro.execution.count.color`                |          | `#8694A9`   | `#6A83AA`   |            |      |
| `libro.tip.font.color`                       |          | `#D6D8DA`   | `#00000080` |            |      |
| `libro.execution.tip.success.color`          |          | `#48A918`   | `#0DC54E`   |            |      |
| `libro.link.color`                           |          | `#177DDC`   | `#1890FF`   |            |      |
| `libro.error.color`                          |          | `#CF4C52`   | `#ED1345`   |            |      |
| `libro.cell.border.color`                    |          | `#3B3C42`   | `#D6DEE6`   |            |      |
| `libro.cell.active.border.color`             |          | `#378EDF`   | `#3490ED`   |            |      |
| `libro.cell.active.border.shadow.color`      |          | `#49A2FA40` | `#3592EE40` |            |      |
| `libro.cell.header.content`                  |          | `#E3E4E6`   | `#545B66`   |            |      |
| `libro.cell.header.title`                    |          | `#D6D8DA`   | `#000A1A`   |            |      |
| `libro.code.border.color`                    |          | `#353638`   | `#DCE4EC`   |            |      |
| `libro.input.border.color`                   |          | `#505559`   | `#00000026` |            |      |
| `libro.input.background.color`               |          | `#FFFFFF0A` | `#FFFFFF`   |            |      |
| `libro.input.group.btn.background.color`     |          | `#00000005` | `#00000005` |            |      |
| `libro.table.innner.border.color`            |          | `#1AFFFF`   | `#E5EBF1`   |            |      |
| `libro.table.bottom.border.color`            |          | `#424242`   | `#E2E7EC`   |            |      |
| `libro.editor.keyword.color`                 |          | `#109B67`   | `#098658`   |            |      |
| `libro.editor.number.color`                  |          | `#109B67`   | `#098658`   |            |      |
| `libro.editor.variable.2.color`              |          | `#5DA4EA`   | `#2060A0`   |            |      |
| `libro.editor.punctuation.color`             |          | `#5DA4EA`   | `#2060A0`   |            |      |
| `libro.editor.property.color`                |          | `#5DA4EA`   | `#2060A0`   |            |      |
| `libro.editor.operator.color`                |          | `#E12EE1`   | `#C700C7`   |            |      |
| `libro.editor.meta.color`                    |          | `#E12EE1`   | `#C700C7`   |            |      |
| `libro.editor.builtin.color`                 |          | `#109B67`   | `#098658`   |            |      |
| `libro.editor.variable.color`                |          | `#E3E4E6`   | `#212121`   |            |      |
| `libro.editor.def.color`                     |          | `#187DFF`   | `#003CFF`   |            |      |
| `libro.editor.comment.color`                 |          | `#618961`   | `#406040`   |            |      |
| `libro.editor.string.color`                  |          | `#FF5B48`   | `#C03030`   |            |      |
| `libro.editor.activeline.color`              |          | `#E5E8F01A` | `#E5E8F080` |            |      |
| `libro.editor.selectionMatch.color`          |          | `#99FF7780` | `#DDE6FF`   |            |      |
| `libro.editor.selection.color`               |          | `#B4CEFF`   | `#B4CEFF`   |            |      |
| `libro.editor.gutter.number.color`           |          | `#A8EABF`   | `#A4AECB`   |            |      |
| `libro.editor.line.color`                    |          | `#565C6D`   | `#A4AECB`   |            |      |
| `libro.editor.cursor.color`                  |          | `#FFFFFF`   | `#000000`   |            |      |
| `libro.editor.indent.marker.bg.color`        |          | `#42444D`   | `#D6DBEB`   |            |      |
| `libro.editor.indent.marker.active.bg.color` |          | `#788491`   | `#9f9f9f`   |            |      |
