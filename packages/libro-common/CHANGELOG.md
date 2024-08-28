# @difizen/libro-common

## 0.2.24

### Patch Changes

- [#181](https://github.com/difizen/libro/pull/181) [`25ad10c`](https://github.com/difizen/libro/commit/25ad10c83956477a1459b312724b679b2a9abb8b) Thanks [@sunshinesmilelk](https://github.com/sunshinesmilelk)! - fix: improve styles

## 0.2.23

### Patch Changes

- [#179](https://github.com/difizen/libro/pull/179) [`e9e5691`](https://github.com/difizen/libro/commit/e9e5691e2f1e6f93830648706e978361d25ca231) Thanks [@sunshinesmilelk](https://github.com/sunshinesmilelk)! - fix(lab): improve dark mode styles

## 0.2.22

### Patch Changes

- [#176](https://github.com/difizen/libro/pull/176) [`5d4099c`](https://github.com/difizen/libro/commit/5d4099c518a5c4498830cefa61257521d5488aee) Thanks [@BroKun](https://github.com/BroKun)! - Using github changelog

## 0.2.21

### Patch Changes

- fb585c4: fix: update cell uri scheme

## 0.2.20

### Patch Changes

- b1ede64: fix: fix server launch in different scenarios

## 0.2.19

### Patch Changes

- e0b6cf1: fix(jupyter): fix the condition when execution btn show tip

## 0.2.18

### Patch Changes

- 472a4a8: fix: fix error denpendencies

## 0.2.17

### Patch Changes

- 106bc9a: feat: add config to allow preferred session & kernel unready text

## 0.2.16

### Patch Changes

- 5fc6eb9: fix: add missing kernelspec dep

## 0.2.15

### Patch Changes

- f0c8f4f: update search highlight color

## 0.2.14

### Patch Changes

- 95855f6: fix: top toolbar invalid when not editable but runnable

## 0.2.13

### Patch Changes

- 24e1ff0: fix: notebook change listener regist duplicate

## 0.2.12

### Patch Changes

- e076504: fix: support kernel recovery

## 0.2.11

### Patch Changes

- c5977db: fix: search highlight next & remove onstart launch & support kernel recovery

## 0.2.10

### Patch Changes

- e0e9e72: fix: cut cell bug when multiple selection

## 0.2.9

### Patch Changes

- 3e534f0: fix: clear cell when libro model initialize

## 0.2.8

### Patch Changes

- 6b49dd7: fix: dispose libroView is invalid

## 0.2.7

### Patch Changes

- c59f4f4: feat: improve keybind panel style

## 0.2.6

### Patch Changes

- 14aa1ba: fix: activate language for diff editor

## 0.2.5

### Patch Changes

- 2543ab8: fix:export KernelAndTerminalPanelView

## 0.2.4

### Patch Changes

- aa3a941: 1.export KernelAndTerminalPanelView &2.copy cell fallback in single page

## 0.2.3

### Patch Changes

- c7d0816: Fix the display of adding cell operation area.

## 0.2.2

### Patch Changes

- a2c76f2: feat(markdown): support for equation rendering

## 0.2.1

### Patch Changes

- 672105a: release 0.2.1

## 0.2.0

### Minor Changes

- 9322774: feat: add inputEditable、cellsEditable、executable、savable and so on

## 0.1.37

### Patch Changes

- fe63f0e: fix(kernel): update interface about IContentsModel

## 0.1.36

### Patch Changes

- 830d767: fix(search): hide searchview when searchVisible is false

## 0.1.35

### Patch Changes

- 5ed93cc: fix dark theme about search view

## 0.1.34

### Patch Changes

- 4c0f10e: Enhance widgets underlying capabilities
- 6c4fcbe: Support widget interactive!

## 0.1.33

### Patch Changes

- 4811299: fix dark theme style

## 0.1.32

### Patch Changes

- 2d90b29: fix(core): add deprecated

## 0.1.31

### Patch Changes

- 3a07805: use modelId for modelCache
- 5b23c6d: Jupyter: integrate jupyter-widgets

## 0.1.30

### Patch Changes

- 3c95a2c: improve keybind panel style

## 0.1.29

### Patch Changes

- d81dd35: Prompt: Migrate libro_server to libro_ai
- d661508: Lab: open file after creation

## 0.1.28

### Patch Changes

- cc94f1d: 1.refactor(jupyter): use ContentSaveContribution

## 0.1.27

### Patch Changes

- 5341bd6: feat: go to definition
  feat: signature help

## 0.1.26

### Patch Changes

- 6a520ad: fix: add import file extension

## 0.1.24

### Patch Changes

- 1bcfbee: 1.fix: get correct url when create notebook file 2.chore: update the peerDependencies about react

## 0.1.23

### Patch Changes

- e37f319: fix: remove useless code about format button

## 0.1.22

### Patch Changes

- 669e05b: fix: valid notebook
  feat(jupyter): add restart kernel
  fix: poll kernelSpec after serverManager ready

## 0.1.21

### Patch Changes

- 9da4081: 1.fix: search view hide not focus libro view

## 0.1.20

### Patch Changes

- f3924d3: 1.fix search scroll on large cell 2.add libroModel in VirtualizedManager

## 0.1.19

### Patch Changes

- fe3ee51: fix:poll kernels when serverManager ready

## 0.1.18

### Patch Changes

- f7c6839: File uploads can now be triggered by right-clicking on the file tree.
- 0f9e69d: Lab supports saving of all code files.
- 0f9e69d: More user-friendly prompt cell setting operation.

## 0.1.17

### Patch Changes

- b159277: insert and execute output in a cell
- 9ff1bf9: Support file download.

## 0.1.16

### Patch Changes

- 7d1edf3: Fix: Make Terminals opened from left panel same as the one you created, instead of creating a new terminal view.
- 90f6f8e: Fix: Cancel observing outputs height change'

## 0.1.15

### Patch Changes

- 1b88a16: Feature: Better Prompt cell! Now based on better prompt magic support, you can use prompt cells to chat directly with OpenAI models. And you can put chats in context and create exciting workflows.

## 0.1.14

### Patch Changes

- 0b882d3: 1. prompt cell adapt to the api of libro-server 2.fix the editor in CodeEditorView is undefined

## 0.1.13

### Patch Changes

- 262ba79: 1. fix the editor in CodeEditorView is undefined

## 0.1.12

### Patch Changes

- bf45fa2: 1. fix:close the open tab when delete the file 2. stop propagation when focus cell right toolbar

## 0.1.11

### Patch Changes

- 236634d: 1.libro keybind not work when switching tabs
  2.auto focus when input file name.
  3.editor resize when CodeEditorViewer resize
  4.add file size warning
  5.add UI for file formats not supported for viewing
  6.file name error when select other format

## 0.1.10

### Patch Changes

- ccdd12d: 1. add remove action in file tree menu

## 0.1.9

### Patch Changes

- ad803e2: 1. use codeEditorViewer as the last resort file viewer. 2. fix terminal

## 0.1.8

### Patch Changes

- 1. Support json and other file formats.
  2. Dynamic shortcut keys and menus when switching tabs.

## 0.1.7

### Patch Changes

- Clean lab modules.

## 0.1.6

### Patch Changes

- Support code file editing.

## 0.1.5

### Patch Changes

- 1. Support image preview.
  2. Export the definition and implementation of the libro lab module.

## 0.1.4

### Patch Changes

- Fix issues with lsp and virtual list.

## 0.1.3

### Patch Changes

- Fix the content format issue of prompt cell

## 0.1.2

### Patch Changes

- 1. Support monaco editor, code cell is migrated to monaco editor by default.
  2. Support virtual lists to improve performance.
  3. libro lab can now use terminal.

## 0.1.1

### Patch Changes

- 1. Prompt cell is now available 🎉.
  2. Better lab UI.

## 0.1.0

### Minor Changes

- 1. All modules used to support the notebook editor.
  2. Support lab products.

### Patch Changes

- 127cb35: Initia version

## 0.0.2-alpha.0

### Patch Changes

- Initia version
