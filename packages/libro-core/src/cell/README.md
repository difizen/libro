# Cell abstraction

## Cell View

缩进代表继承关系

- LibroCellView
  - LibroEditorCellView: 带有文本编辑器相关能力
    - LibroExecutableCellView: 带有执行、输出能力
      - LibroCodeCellView
        - AIStudioLibroCodeCellView
      - LibroSqlCellView
    - LibroMarkdownCellView
    - LibroRawCellView
