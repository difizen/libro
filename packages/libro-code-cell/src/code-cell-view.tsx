/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-parameter-properties */
/* eslint-disable @typescript-eslint/parameter-properties */
import type { CodeEditorViewOptions, CodeEditorView } from '@difizen/libro-code-editor';
import { CodeEditorManager } from '@difizen/libro-code-editor';
import type { ICodeCell, IOutput } from '@difizen/libro-common';
import { isOutput } from '@difizen/libro-common';
import type {
  IOutputAreaOption,
  LibroCell,
  CellViewOptions,
} from '@difizen/libro-core';
import {
  CellService,
  EditorStatus,
  LibroExecutableCellView,
  LibroOutputArea,
  VirtualizedManagerHelper,
  LirboContextKey,
} from '@difizen/libro-core';
import type { ViewSize } from '@difizen/mana-app';
import { Disposable } from '@difizen/mana-app';
import { DisposableCollection } from '@difizen/mana-app';
import {
  getOrigin,
  inject,
  prop,
  transient,
  useInject,
  view,
  ViewInstance,
  ViewManager,
  ViewOption,
  ViewRender,
  watch,
  Deferred,
} from '@difizen/mana-app';
import { useEffect, useRef, memo, forwardRef } from 'react';

import type { LibroCodeCellModel } from './code-cell-model.js';

function countLines(inputString: string) {
  const lines = inputString.split('\n');
  return lines.length;
}

const CellEditor: React.FC = () => {
  const instance = useInject<LibroCodeCellView>(ViewInstance);
  const virtualizedManagerHelper = useInject(VirtualizedManagerHelper);
  const virtualizedManager = virtualizedManagerHelper.getOrCreate(
    instance.parent.model,
  );
  const editorRef = useRef(null);

  useEffect(() => {
    if (instance.editorView?.editor) {
      instance.editor = getOrigin(instance.editorView?.editor);
    }
  }, [instance, instance.editorView?.editor]);

  if (virtualizedManager.isVirtualized) {
    instance.renderEditorIntoVirtualized = true;
    if (instance.setEditorHost) {
      instance.setEditorHost(editorRef);
    }

    const editorAreaHeight = instance.calcEditorAreaHeight();

    return (
      <div
        style={{
          height: `${editorAreaHeight || 0}px`,
          width: '100%',
        }}
        ref={editorRef}
      />
    );
  } else {
    return <>{instance.editorView && <ViewRender view={instance.editorView} />}</>;
  }
};

export const CellEditorMemo = memo(CellEditor);

const CodeEditorViewComponent = forwardRef<HTMLDivElement>(
  function CodeEditorViewComponent(props, ref) {
    const instance = useInject<LibroCodeCellView>(ViewInstance);

    return (
      <div
        className="libro-codemirror-cell-editor"
        ref={ref}
        tabIndex={10}
        onBlur={instance.blur}
      >
        <CellEditorMemo />
      </div>
    );
  },
);

@transient()
@view('code-editor-cell-view')
export class LibroCodeCellView extends LibroExecutableCellView {
  protected toDisposeOnEditor = new DisposableCollection();
  @inject(LirboContextKey) protected readonly lirboContextKey: LirboContextKey;
  override view = CodeEditorViewComponent;

  viewManager: ViewManager;

  codeEditorManager: CodeEditorManager;

  declare model: LibroCodeCellModel;

  outputs: IOutput[];

  @prop()
  editorView?: CodeEditorView;

  @prop()
  editorAreaHeight = 0;

  @prop()
  override noEditorAreaHeight = 0;

  @prop()
  override cellViewTopPos = 0;

  @prop()
  override editorStatus: EditorStatus = EditorStatus.NOTLOADED;

  protected outputAreaDeferred = new Deferred<LibroOutputArea>();
  get outputAreaReady() {
    return this.outputAreaDeferred.promise;
  }

  override renderEditor = () => {
    if (this.editorView) {
      return <ViewRender view={this.editorView} />;
    }
    return null;
  };

  override onViewResize(size: ViewSize) {
    if (size.height) {
      this.editorAreaHeight = size.height;
    }
  }

  calcEditorAreaHeight() {
    if (
      this.editorStatus === EditorStatus.NOTLOADED ||
      this.editorStatus === EditorStatus.LOADING
    ) {
      const { lineHeight, paddingTop, paddingBottom, scrollBarHeight } =
        this.codeEditorManager.getUserEditorConfig(this.model);

      const codeHeight = countLines(this.model.value) * (lineHeight ?? 20);
      const editorPadding = paddingTop + paddingBottom;

      const editorAreaHeight = codeHeight + editorPadding + scrollBarHeight;

      this.editorAreaHeight = editorAreaHeight;
    }

    // 编辑器已经加载的情况下cell高度都由对它的高度监听得到。
    return this.editorAreaHeight;
  }

  constructor(
    @inject(ViewOption) options: CellViewOptions,
    @inject(CellService) cellService: CellService,
    @inject(ViewManager) viewManager: ViewManager,
    @inject(CodeEditorManager) codeEditorManager: CodeEditorManager,
  ) {
    super(options, cellService);
    this.options = options;
    this.viewManager = viewManager;
    this.codeEditorManager = codeEditorManager;

    this.outputs = options.cell?.outputs as IOutput[];
    this.className = this.className + ' code';

    // 创建outputArea
    this.viewManager
      .getOrCreateView<LibroOutputArea, IOutputAreaOption>(LibroOutputArea, {
        cellId: this.id,
        cell: this,
      })
      .then(async (outputArea) => {
        this.outputArea = outputArea;
        const output = this.outputs;
        if (isOutput(output)) {
          await this.outputArea.fromJSON(output);
        }
        this.outputAreaDeferred.resolve(outputArea);
        this.outputWatch();
        return;
      })
      .catch(console.error);
  }

  override outputWatch() {
    this.toDispose.push(
      watch(this.outputArea, 'outputs', () => {
        this.parent.model.onChange?.();
      }),
    );
  }

  override toJSON(): LibroCell {
    const meta = super.toJSON();
    return {
      ...meta,
      outputs: this.outputArea?.toJSON() ?? this.outputs,
    } as ICodeCell;
  }

  override onViewMount() {
    this.createEditor();
  }

  setEditorHost(ref: any) {
    const editorHostId = this.parent.id + this.id;
    this.codeEditorManager.setEditorHostRef(editorHostId, ref);
  }

  protected getEditorOption(): CodeEditorViewOptions {
    const option: CodeEditorViewOptions = {
      uuid: `${this.parent.model.id}-${this.model.id}`,
      editorHostId: this.parent.id + this.id,
      model: this.model,
      config: {
        readOnly: this.parent.model.readOnly,
        editable: !this.parent.model.readOnly,
        placeholder: '请输入代码',
      },
    };
    return option;
  }

  protected async createEditor() {
    const option = this.getEditorOption();

    this.editorStatus = EditorStatus.LOADING;

    // 防止虚拟滚动中编辑器被频繁创建
    if (this.editorView) {
      this.editorStatus = EditorStatus.LOADED;
      return;
    }

    const editorView = await this.codeEditorManager.getOrCreateEditorView(option);

    this.editorView = editorView;
    this.editorStatus = EditorStatus.LOADED;

    editorView.onEditorStatusChange((e) => {
      if (e.status === 'ready') {
        this.editor = this.editorView!.editor;
        this.afterEditorReady();
      } else if (e.status === 'disposed') {
        this.toDisposeOnEditor.dispose();
      }
    });
  }

  protected async afterEditorReady() {
    this.focusEditor();
    this.toDisposeOnEditor.push(
      watch(this.parent.model, 'readOnly', () => {
        this.editorView?.editor?.setOption(
          'readOnly',
          getOrigin(this.parent.model.readOnly),
        );
      }),
    );
    this.toDisposeOnEditor.push(
      this.editorView?.onModalChange((val) => (this.hasModal = val)) ?? Disposable.NONE,
    );
    this.toDisposeOnEditor.push(
      this.editor?.onModelContentChanged?.((e) => {
        this.parent.model.onCellContentChange({ cell: this, changes: e });
      }) ?? Disposable.NONE,
    );
  }

  protected focusEditor() {
    //选中cell、编辑模式、非只读时才focus
    if (
      this.editorView?.editor &&
      this.editorView.editorStatus === 'ready' &&
      this.parent.model.active?.id === this.id &&
      !this.parent.model.commandMode &&
      this.lirboContextKey.commandModeEnabled === true && // 排除弹窗等情况
      this.parent.model.readOnly === false
    ) {
      this.editorView?.editor.setOption('styleActiveLine', true);
      this.editorView?.editor.setOption('highlightActiveLineGutter', true);
      this.editorView?.editor.focus();
    }
  }

  override shouldEnterEditorMode(e: React.FocusEvent<HTMLElement>) {
    return getOrigin(this.editorView)?.editor?.host?.contains(e.target as HTMLElement)
      ? true
      : false;
  }

  override blur = () => {
    this.editorView?.editor?.setOption('styleActiveLine', false);
    this.editorView?.editor?.setOption('highlightActiveLineGutter', false);
  };

  override focus = (toEdit: boolean) => {
    if (toEdit) {
      this.focusEditor();
    } else {
      if (this.container?.current?.parentElement?.contains(document.activeElement)) {
        return;
      }
      this.container?.current?.parentElement?.focus();
    }
  };

  override clearExecution = () => {
    this.model.clearExecution();
    this.outputArea.clear();
  };
}
