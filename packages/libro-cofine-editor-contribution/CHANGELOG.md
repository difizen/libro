# @difizen/libro-codemirror-markdown-cell

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
- Updated dependencies
  - @difizen/libro-code-editor@0.1.1
  - @difizen/libro-codemirror@0.1.1
  - @difizen/libro-common@0.1.1
  - @difizen/libro-core@0.1.1
  - @difizen/libro-markdown@0.1.1

## 0.1.0

### Minor Changes

- 1. All modules used to support the notebook editor.
  2. Support lab products.

### Patch Changes

- 127cb35: Initia version
- Updated dependencies [127cb35]
- Updated dependencies
  - @difizen/libro-code-editor@0.1.0
  - @difizen/libro-codemirror@0.1.0
  - @difizen/libro-common@0.1.0
  - @difizen/libro-core@0.1.0
  - @difizen/libro-markdown@0.1.0

## 0.0.2-alpha.0

### Patch Changes

- Initia version
- Updated dependencies
  - @difizen/libro-code-editor@0.0.2-alpha.0
  - @difizen/libro-codemirror@0.0.2-alpha.0
  - @difizen/libro-common@0.0.2-alpha.0
  - @difizen/libro-core@0.0.2-alpha.0
  - @difizen/libro-markdown@0.0.2-alpha.0
