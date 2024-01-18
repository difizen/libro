import { CodeEditorManager } from '@difizen/libro-code-editor';
import type {
  CodeEditorViewOptions,
  IRange,
  CodeEditorView,
} from '@difizen/libro-code-editor';
import type { ICodeCell, IOutput } from '@difizen/libro-common';
import { isOutput } from '@difizen/libro-common';
import type {
  IOutputAreaOption,
  LibroCell,
  CellViewOptions,
} from '@difizen/libro-core';
import {
  CellService,
  LibroExecutableCellView,
  LibroOutputArea,
  LibroViewTracker,
  EditorStatus,
  LirboContextKey,
} from '@difizen/libro-core';
import type { ExecutionMeta, KernelMessage } from '@difizen/libro-jupyter';
import { KernelError, LibroJupyterModel } from '@difizen/libro-jupyter';
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
} from '@difizen/mana-app';
import { Deferred } from '@difizen/mana-app';
import { Select, Tag } from 'antd';
import React, { useEffect, useState } from 'react';

import type { LibroPromptCellModel } from './prompt-cell-model.js';
import { PromptScript } from './prompt-cell-script.js';

export interface ChatItem {
  name: string;
  type: string;
  order: number;
  key: string;
}
export interface ChatTypeOptions {
  order?: number;
  color?: string;
}

const ChatItemOptions = (type: string): ChatTypeOptions => {
  switch (type) {
    case 'LLM':
      return {
        order: 1,
        color: 'blue',
      };
    case 'VARIABLE':
      return {
        order: 2,
        color: 'red',
      };
    case 'API':
      return {
        order: 3,
        color: 'green',
      };
    case 'CUSTOM':
      return {
        order: 4,
        color: undefined,
      };
    default:
      return {
        order: undefined,
        color: undefined,
      };
  }
};

const SelectionItemLabel: React.FC<{ item: ChatItem }> = (props: {
  item: ChatItem;
}) => {
  const item = props.item;

  return (
    <span className="libro-prompt-cell-selection-label">
      <Tag
        color={ChatItemOptions(item.type).color}
        className="libro-prompt-cell-header-selection-type"
      >
        {item.type}
      </Tag>
      <span className="libro-prompt-cell-header-selection-name">{item.name}</span>
    </span>
  );
};
const CellEditor: React.FC = () => {
  const instance = useInject<LibroPromptCellView>(ViewInstance);
  useEffect(() => {
    if (instance.editorView?.editor) {
      instance.editor = getOrigin(instance.editorView?.editor);
    }
  }, [instance, instance.editorView?.editor]);
  return <>{instance.editorView && <ViewRender view={instance.editorView} />}</>;
};

export const CellEditorMemo = React.memo(CellEditor);

const PropmtEditorViewComponent = React.forwardRef<HTMLDivElement>(
  function MaxPropmtEditorViewComponent(props, ref) {
    const instance = useInject<LibroPromptCellView>(ViewInstance);
    const [selectedModel, setSelectedModel] = useState<string>('暂无内置模型');
    useEffect(() => {
      instance
        .updateChatList()
        .then(() => {
          const len = instance.chatItems.length;
          if (len > 0) {
            instance.model.decodeObject = {
              modelType: instance.chatItems[len - 1].key,
              ...instance.model.decodeObject,
            };
            setSelectedModel(instance.model.decodeObject['modelType']);
            instance.model.modelType = instance.model.decodeObject['modelType'];
            return;
          }
          return;
        })
        .catch(() => {
          //
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (value: string) => {
      instance.model.modelType = value;
      instance.model.decodeObject = {
        ...instance.model.decodeObject,
        modelType: value,
      };
      setSelectedModel(value);
    };

    return (
      <div
        className={instance.className}
        ref={ref}
        tabIndex={10}
        onBlur={instance.blur}
      >
        <div className="libro-prompt-cell-header">
          <div className="libro-prompt-cell-header-model-config">
            <Select
              value={selectedModel}
              style={{ width: 160 }}
              onChange={handleChange}
              options={instance.sortedChatItems.map(instance.toSelectionOption)}
              bordered={false}
              onFocus={async () => {
                await instance.updateChatList();
              }}
            />
          </div>
        </div>
        <CellEditorMemo />
      </div>
    );
  },
);

@transient()
@view('prompt-editor-cell-view')
export class LibroPromptCellView extends LibroExecutableCellView {
  @inject(LirboContextKey) protected readonly lirboContextKey: LirboContextKey;
  override view = PropmtEditorViewComponent;

  declare model: LibroPromptCellModel;

  @prop()
  chatItems: ChatItem[] = [];

  get sortedChatItems(): ChatItem[] {
    return [...this.chatItems].sort((a, b) => {
      if (a.type !== b.type) {
        const aOrder = ChatItemOptions(a.type).order || 0;
        const bOrder = ChatItemOptions(b.type).order || 0;
        if (aOrder === bOrder && aOrder === 0) {
          return a.type.localeCompare(b.type);
        }
        return aOrder - bOrder;
      }
      return a.order - b.order;
    });
  }

  viewManager: ViewManager;

  @inject(CodeEditorManager) codeEditorManager: CodeEditorManager;
  @inject(PromptScript) promptScript: PromptScript;

  outputs: IOutput[];

  libroViewTracker: LibroViewTracker;

  @prop()
  editorView?: CodeEditorView;

  protected outputAreaDeferred = new Deferred<LibroOutputArea>();
  get outputAreaReady() {
    return this.outputAreaDeferred.promise;
  }

  constructor(
    @inject(ViewOption) options: CellViewOptions,
    @inject(CellService) cellService: CellService,
    @inject(ViewManager) viewManager: ViewManager,
    @inject(LibroViewTracker) libroViewTracker: LibroViewTracker,
  ) {
    super(options, cellService);
    this.options = options;
    this.viewManager = viewManager;
    this.className = this.className + ' prompt';

    this.outputs = options.cell?.outputs as IOutput[];
    this.libroViewTracker = libroViewTracker;

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
      .catch(() => {
        //
      });
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
      source: meta.source ?? this.options.cell.source,
      outputs: this.outputArea?.toJSON() ?? this.outputs,
    } as ICodeCell;
  }

  override onViewMount() {
    this.createEditor();
    //选中cell时才focus
    if (this.parent.model.active?.id === this.id) {
      this.focus(!this.parent.model.commandMode);
    }
  }

  protected getEditorOption(): CodeEditorViewOptions {
    const option: CodeEditorViewOptions = {
      uuid: `${this.parent.model.id}-${this.model.id}`,
      editorHostId: this.parent.id + this.id,
      model: this.model,
      config: {
        readOnly: this.parent.model.readOnly,
        editable: !this.parent.model.readOnly,
      },
    };
    return option;
  }

  async createEditor() {
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

    await this.afterEditorReady();
  }

  protected async afterEditorReady() {
    watch(this.parent.model, 'readOnly', () => {
      this.editorView?.editor?.setOption(
        'readOnly',
        getOrigin(this.parent.model.readOnly),
      );
    });
    this.editorView?.onModalChange((val) => (this.hasModal = val));
  }

  override shouldEnterEditorMode(e: React.FocusEvent<HTMLElement>) {
    return getOrigin(this.editorView)?.editor?.host?.contains(
      e.target as HTMLElement,
    ) && this.parent.model.commandMode
      ? true
      : false;
  }

  override blur = () => {
    this.editorView?.editor?.setOption('styleActiveLine', false);
    this.editorView?.editor?.setOption('highlightActiveLineGutter', false);
  };

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

  getSelections = (): [] => {
    return this.editor?.getSelections() as [];
  };

  getSelectionsOffsetAt = (selection: IRange) => {
    const isSelect = selection;
    const start = this.editor?.getOffsetAt(isSelect.start) ?? 0;
    const end = this.editor?.getOffsetAt(isSelect.end) ?? 0;
    return { start: start, end: end };
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
          const meta = this.model.metadata.execution as ExecutionMeta;
          if (meta) {
            meta['shell.execute_reply.started'] = startTimeStr;
          }
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

  fetch = async (
    content: KernelMessage.IExecuteRequestMsg['content'],
    ioCallback: (msg: KernelMessage.IIOPubMessage) => any,
  ) => {
    const model = this.parent?.model as LibroJupyterModel;
    await model.kcReady;
    const connection = model.kernelConnection!;
    const future = connection.requestExecute(content);
    future.onIOPub = (msg) => {
      ioCallback(msg);
    };
    return future.done as Promise<KernelMessage.IExecuteReplyMsg>;
  };

  updateChatList = async () => {
    return this.fetch(
      { code: this.promptScript.toList, store_history: false },
      this.handleQueryResponse,
    );
  };

  toSelectionOption = (item: ChatItem) => {
    return {
      value: item.key,
      label: <SelectionItemLabel item={item} />,
    };
  };

  handleQueryResponse = (response: KernelMessage.IIOPubMessage) => {
    const msgType = response.header.msg_type;
    switch (msgType) {
      case 'execute_result': {
        const payload = response as KernelMessage.IExecuteResultMsg;
        let content: string = payload.content.data['text/plain'] as string;
        if (content.slice(0, 1) === "'" || content.slice(0, 1) === '"') {
          content = content.slice(1, -1);
          content = content.replace(/\\"/g, '"').replace(/\\'/g, "'");
        }

        this.chatItems = JSON.parse(content) as ChatItem[];
        break;
      }
      case 'stream': {
        const payloadDisplay = response as KernelMessage.IStreamMsg;
        let contentStream: string = payloadDisplay.content.text as string;
        if (contentStream.slice(0, 1) === "'" || contentStream.slice(0, 1) === '"') {
          contentStream = contentStream.slice(1, -1);
          contentStream = contentStream.replace(/\\"/g, '"').replace(/\\'/g, "'");
        }

        this.chatItems = JSON.parse(contentStream) as ChatItem[];
        break;
      }
      default:
        break;
    }
  };
}
