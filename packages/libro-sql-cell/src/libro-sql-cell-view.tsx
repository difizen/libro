import { EditFilled, LinkOutlined } from '@ant-design/icons';
import type { CodeEditorViewOptions, CodeEditorView } from '@difizen/libro-code-editor';
import { CodeEditorManager } from '@difizen/libro-code-editor';
import type { ICodeCell, IOutput } from '@difizen/libro-common';
import { CellUri, isOutput } from '@difizen/libro-common';
import type {
  CellViewOptions,
  ExecutionMeta,
  IOutputAreaOption,
  LibroCell,
} from '@difizen/libro-jupyter';
import { KernelError } from '@difizen/libro-jupyter';
import { LibroJupyterModel } from '@difizen/libro-jupyter';
import {
  CellService,
  EditorStatus,
  LibroContextKey,
  LibroExecutableCellView,
  LibroViewTracker,
  VirtualizedManagerHelper,
} from '@difizen/libro-jupyter';
import { LibroOutputArea } from '@difizen/libro-jupyter';
import type { ViewSize } from '@difizen/mana-app';
import {
  Deferred,
  Disposable,
  DisposableCollection,
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
} from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import type { MenuProps } from 'antd';
import { Dropdown, Input, Popover, Tooltip } from 'antd';
import React from 'react';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import './index.less';
import { LibroSqlCellModel } from './libro-sql-cell-model.js';
import { getDfVariableName } from './libro-sql-utils.js';

function countLines(inputString: string) {
  const lines = inputString.split('\n');
  return lines.length;
}

const CellEditor: React.FC = () => {
  const instance = useInject<LibroSqlCellView>(ViewInstance);
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

    const editorAreaHeight = instance.calcEditorAreaHeight();
    if (instance.setEditorHost) {
      instance.setEditorHost(editorRef);
    }

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

interface LibroSqlVariableProps {
  handCancel: () => void; // 定义 handCancel 是一个函数类型
}

const LibroSqlVariableNameInput: React.FC<LibroSqlVariableProps> = ({
  handCancel,
}: LibroSqlVariableProps) => {
  const cellView = useInject<LibroSqlCellView>(ViewInstance);
  const [resultVariableAvailable, setVariableNameAvailable] = useState(true);
  const [resultVariable, setVariableName] = useState(cellView.model.resultVariable);
  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (
        cellView.parent.model.cells.findIndex(
          (cell) =>
            cell.model instanceof LibroSqlCellModel &&
            cell.model.resultVariable === e.target.value,
        ) > -1
      ) {
        setVariableNameAvailable(false);
      } else {
        setVariableNameAvailable(true);
      }
      setVariableName(e.target.value);
    },
    [cellView.parent.model.cells],
  );

  const handValueSave = useCallback(() => {
    cellView.model.resultVariable = getDfVariableName(
      cellView.parent.model.cells.filter(
        (cell) => cell.model.type === 'sql',
      ) as LibroSqlCellView[],
    );
    cellView.model.resultVariable = resultVariable;
    if (cellView.parent.model.onChange) {
      cellView.parent.model.onChange();
    }
    handCancel();
  }, [cellView.model, cellView.parent.model, handCancel, resultVariable]);

  return (
    <>
      <Input
        status={`${resultVariableAvailable ? '' : 'warning'}`}
        className="libro-sql-variable-name-input"
        onChange={handleValueChange}
        defaultValue={cellView.model.resultVariable}
      />

      {!resultVariableAvailable && (
        <span className="libro-sql-input-warning-text">
          {l10n.t('当前变量名已存在')}
        </span>
      )}

      <div className="libro-sql-input-button">
        <span onClick={handCancel} className="libro-sql-input-cancel">
          {l10n.t('取消')}
        </span>
        <span onClick={handValueSave} className="libro-sql-input-save">
          {l10n.t('保存')}
        </span>
      </div>
    </>
  );
};

export const LibroSqlCell = React.forwardRef<HTMLDivElement>(
  function MaxPropmtEditorViewComponent(props, ref) {
    const [isVariableNameEdit, setIsVariableNameEdit] = useState(false);
    const instance = useInject<LibroSqlCellView>(ViewInstance);
    const contextKey = useInject(LibroContextKey);
    const [, setTmpShowTourStorage] = useState(
      !localStorage.getItem('libro-tmp-show-tour') &&
        !localStorage.getItem('libro-first-tmps-show-tour'),
    );

    localStorage.setItem('libro-first-tmps-show-tour', 'true');

    const items: MenuProps['items'] = [
      {
        key: 'Dataframe',
        label: <span>Dataframe</span>,
        disabled:
          !instance.parent.model.cellsEditable || !instance.parent.model.inputEditable,
      },
      {
        key: 'TmpTable',
        label: <span>ODPS Dataframe</span>,
        disabled:
          !instance.parent.model.cellsEditable || !instance.parent.model.inputEditable,
      },
    ];

    const handCancelEdit = () => {
      contextKey.enableCommandMode();
      setIsVariableNameEdit(false);
    };

    useEffect(() => {
      if (!localStorage.getItem('libro-tmp-show-tour')) {
        setTimeout(() => {
          setTmpShowTourStorage(false);
        }, 5000);
      }
    }, []);

    return (
      <div tabIndex={10} ref={ref} className={instance.className}>
        <div className="libro-sql-cell-header">
          <div className="libro-sql-source">
            <span className="libro-sql-source-title">Source: </span>
            <span className="libro-sql-source-content">ODPS</span>
          </div>
          <div className="libro-sql-variable-name">
            <span className="libro-sql-variable-name-title">Name: </span>
            <span className="libro-sql-variable-content">
              {instance.model.resultVariable}
            </span>
            <div
              className="libro-sql-variable-name-popover"
              style={{ display: 'inline-block' }}
            >
              <Popover
                content={<LibroSqlVariableNameInput handCancel={handCancelEdit} />}
                placement="bottomLeft"
                open={instance.parent.model.inputEditable ? isVariableNameEdit : false}
                onOpenChange={(visible) => {
                  if (visible) {
                    contextKey.disableCommandMode();
                  } else {
                    contextKey.enableCommandMode();
                  }
                  setIsVariableNameEdit(visible);
                }}
                getPopupContainer={() => {
                  return instance.container?.current?.getElementsByClassName(
                    'libro-sql-variable-name',
                  )[0] as HTMLElement;
                }}
                trigger="click"
                overlayClassName="libro-sql-popover-container"
              >
                <EditFilled className="libro-sql-edit-icon" />
              </Popover>
            </div>
          </div>
        </div>
        <CellEditor />
      </div>
    );
  },
);

@transient()
@view('libro-sql-cell-view')
export class LibroSqlCellView extends LibroExecutableCellView {
  override view = LibroSqlCell;
  declare model: LibroSqlCellModel;
  libroViewTracker: LibroViewTracker;
  codeEditorManager: CodeEditorManager;
  protected toDisposeOnEditor = new DisposableCollection();

  @inject(LibroContextKey) protected readonly libroContextKey: LibroContextKey;

  outputs: IOutput[];

  @prop()
  editorView?: CodeEditorView;

  @prop()
  override editorStatus: EditorStatus = EditorStatus.NOTLOADED;

  @prop()
  editorAreaHeight = 0;

  @prop()
  override noEditorAreaHeight = 0;

  protected editorViewReadyDeferred: Deferred<void> = new Deferred<void>();

  get editorReady() {
    return this.editorViewReadyDeferred.promise;
  }

  override renderEditor = () => {
    if (this.editorView) {
      return <ViewRender view={this.editorView} />;
    }
  };

  // 计算编辑器区相对于编辑器区垂直方向的偏移量
  override calcEditorOffset() {
    return super.calcEditorOffset() + 36;
  }

  calcEditorAreaHeight() {
    if (
      this.editorStatus === EditorStatus.NOTLOADED ||
      this.editorStatus === EditorStatus.LOADING
    ) {
      const { lineHeight, paddingTop, paddingBottom } =
        this.codeEditorManager.getUserEditorConfig(this.model);
      const codeHeight = countLines(this.model.value) * lineHeight!;
      const editorPadding = paddingTop + paddingBottom;

      const scrollbarHeight = 12;

      // TODO: 滚动条有条件显示

      const editorAreaHeight = codeHeight + editorPadding + scrollbarHeight;

      this.editorAreaHeight = editorAreaHeight;
    }

    // 编辑器已经加载的情况下cell高度都由对它的高度监听得到。
    return this.editorAreaHeight;
  }

  protected outputAreaDeferred = new Deferred<LibroOutputArea>();
  get outputAreaReady() {
    return this.outputAreaDeferred.promise;
  }

  constructor(
    @inject(ViewOption) options: CellViewOptions,
    @inject(CellService) cellService: CellService,
    @inject(ViewManager) viewManager: ViewManager,
    @inject(LibroViewTracker) libroViewTracker: LibroViewTracker,
    @inject(CodeEditorManager) codeEditorManager: CodeEditorManager,
  ) {
    super(options, cellService);
    this.codeEditorManager = codeEditorManager;

    this.outputs = options.cell?.outputs as IOutput[];
    this.className = this.className + ' sql';

    viewManager
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
      .catch(() => {
        //
      });
    this.libroViewTracker = libroViewTracker;
    if (!this.model.resultVariable) {
      this.model.resultVariable = getDfVariableName(
        this.libroViewTracker.viewCache
          .get(options.parentId)
          ?.model.cells.filter(
            (cell) => cell.model.type === 'sql',
          ) as LibroSqlCellView[],
      );
    }
  }

  override onViewMount = async () => {
    await this.createEditor();
  };

  setEditorHost(ref: any) {
    const editorHostId = this.parent.id + this.id;
    this.codeEditorManager.setEditorHostRef(editorHostId, ref);
  }

  async createEditor() {
    const editorHostId = this.parent.id + this.id;
    const option: CodeEditorViewOptions = {
      uuid: CellUri.from(this.parent.model.id, this.model.id).toString(),
      editorHostId: editorHostId,
      model: this.model,
      config: {
        readOnly: !this.parent.model.inputEditable,
        editable: this.parent.model.inputEditable,
      },
    };
    // 防止虚拟滚动中编辑器被频繁创建
    if (this.editorView) {
      this.editorStatus = EditorStatus.LOADED;
      return;
    }

    const editorView = await this.codeEditorManager.getOrCreateEditorView(option);

    this.editorView = editorView;
    this.editorStatus = EditorStatus.LOADED;
    this.editorViewReadyDeferred.resolve();
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
      watch(this.parent.model, 'inputEditable', () => {
        this.editorView?.editor?.setOption(
          'readOnly',
          getOrigin(!this.parent.model.inputEditable),
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
      this.libroContextKey.commandModeEnabled === true && // 排除弹窗等情况
      this.parent.model.inputEditable
    ) {
      this.editorView?.editor.setOption('styleActiveLine', true);
      this.editorView?.editor.setOption('highlightActiveLineGutter', true);
      this.editorView?.editor.focus();
    }
  }

  override onViewResize = (size: ViewSize): void => {
    // 把 header 部分高度也放在这部分，用来撑开高度
    if (size.height) {
      this.editorAreaHeight = size.height + 36;
    }
  };

  override toJSON(): LibroCell {
    const meta = super.toJSON();
    return {
      ...meta,
      source: meta.source ?? this.options.cell.source,
      outputs: this.outputArea?.toJSON() ?? this.outputs,
    } as ICodeCell;
  }

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

  override blur = () => {
    this.editorView?.editor?.setOption('styleActiveLine', false);
    this.editorView?.editor?.setOption('highlightActiveLineGutter', false);
  };

  override clearExecution = () => {
    this.model.clearExecution();
    this.outputArea.clear();
  };

  override async run() {
    const libroModel = this.parent.model;
    if (
      !libroModel ||
      !(libroModel instanceof LibroJupyterModel) ||
      !libroModel.kernelConnection ||
      libroModel.kernelConnection.isDisposed
    ) {
      return false;
    }
    const kernelConnection = getOrigin(libroModel.kernelConnection);
    const cellContent = this.model.source;
    try {
      // Promise.resolve().then(() => {
      this.clearExecution();
      // });
      const future = kernelConnection.requestExecute({
        code: cellContent,
      });
      let startTimeStr = null;
      this.model.executing = true;
      this.model.metadata['execution'] = {
        'shell.execute_reply.started': '',
        'shell.execute_reply.end': '',
        to_execute: new Date().toISOString(),
      } as ExecutionMeta;
      // Handle iopub messages
      future.onIOPub = (msg: any) => {
        this.model.msgChangeEmitter.fire(msg);
        if (msg.header.msg_type === 'execute_input') {
          this.model.kernelExecuting = true;
          startTimeStr = msg.header.date as string;
          const meta = this.model.metadata['execution'] as ExecutionMeta;
          if (meta) {
            meta['shell.execute_reply.started'] = startTimeStr;
          }
        }
        if (msg.header.msg_type === 'execute_result') {
          this.model.metadata['isVariableSaved'] =
            msg.content.data['application/vnd.libro.sql+json'].isVariableSaved;
        }
        if (msg.header.msg_type === 'error') {
          this.model.hasExecutedError = true;
        }
      };
      const msgPromise = await future.done;
      this.model.executing = false;
      this.model.kernelExecuting = false;
      this.model.hasExecutedSuccess = !this.model.hasExecutedError;
      startTimeStr = msgPromise.metadata['started'] as string; // 更新startTimeStr
      const endTimeStr = msgPromise.header.date;
      this.model.metadata['execution']['shell.execute_reply.started'] = startTimeStr;
      this.model.metadata['execution']['shell.execute_reply.end'] = endTimeStr;
      if (!msgPromise) {
        return true;
      }
      if (msgPromise.content.status === 'ok') {
        return true;
      } else {
        throw new KernelError(msgPromise.content);
      }
    } catch (reason: any) {
      if (reason.message.startsWith('Canceled')) {
        return false;
      }
      throw reason;
    }
  }

  override shouldEnterEditorMode(e: React.FocusEvent<HTMLElement>) {
    return getOrigin(this.editorView)?.editor?.host?.contains(e.target as HTMLElement)
      ? true
      : false;
  }
}
