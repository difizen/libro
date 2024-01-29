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
import { LibroOutputArea } from '@difizen/libro-core';
import {
  CellService,
  LibroExecutableCellView,
  LibroViewTracker,
  EditorStatus,
  LirboContextKey,
} from '@difizen/libro-core';
import type { ExecutionMeta, KernelMessage } from '@difizen/libro-jupyter';
import { KernelError, LibroJupyterModel } from '@difizen/libro-jupyter';
import {
  CommandRegistry,
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
import { Button, Divider, Select, Tag } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';

import { ChatRecordInput, VariableNameInput } from './input-handler/index.js';
import { LibroPromptCellModel } from './prompt-cell-model.js';
import { PromptScript } from './prompt-cell-script.js';
import './index.less';
import { MessageOutlined } from '@ant-design/icons';

import { ChatCommands, ChatHandler } from './chat/index.js';

export interface ChatObject {
  name: string;
  type: string;
  order: number;
  key: string;
  disabled?: boolean;
}

function ChatObjectFromKey(key: string): ChatObject {
  const [type, name] = key.split(':');
  return {
    name,
    type,
    key,
    order: 0,
    disabled: true,
  };
}
export interface ChatObjectOptions {
  order?: number;
  color?: string;
}

const ChatObjectOptions = (type: string): ChatObjectOptions => {
  switch (type) {
    case 'LLM':
      return {
        order: 1,
        color: 'blue',
      };
    case 'LMM':
      return {
        order: 2,
        color: 'cyan',
      };
    case 'VARIABLE':
      return {
        order: 3,
        color: 'red',
      };
    case 'API':
      return {
        order: 4,
        color: 'green',
      };
    case 'CUSTOM':
      return {
        order: 5,
        color: undefined,
      };
    default:
      return {
        order: undefined,
        color: undefined,
      };
  }
};

const SelectionItemLabel: React.FC<{ item: ChatObject }> = (props: {
  item: ChatObject;
}) => {
  const item = props.item;

  return (
    <span
      className={classNames('libro-prompt-cell-selection', {
        'libro-prompt-cell-selection-disabled': item.disabled,
      })}
    >
      <Tag
        color={ChatObjectOptions(item.type).color}
        className="libro-prompt-cell-selection-tag"
      >
        {item.type}
      </Tag>
      <span className="libro-prompt-cell-selection-name">{item.name}</span>
    </span>
  );
};
const CellEditorRaw: React.FC = () => {
  const instance = useInject<LibroPromptCellView>(ViewInstance);
  useEffect(() => {
    if (instance.editorView?.editor) {
      instance.editor = getOrigin(instance.editorView?.editor);
    }
  }, [instance, instance.editorView?.editor]);
  return <>{instance.editorView && <ViewRender view={instance.editorView} />}</>;
};

export const CellEditor = React.memo(CellEditorRaw);

const PropmtEditorViewComponent = React.forwardRef<HTMLDivElement>(
  function MaxPropmtEditorViewComponent(props, ref) {
    const instance = useInject<LibroPromptCellView>(ViewInstance);
    const [selectedModel, setSelectedModel] = useState<string>('暂无内置模型');
    useEffect(() => {
      // TODO: Data initialization should not depend on view initialization, which causes limitations in usage scenarios and multiple renderings.
      instance.model.variableName = instance.model.decodeObject.variableName;
      instance
        .updateChatObjects()
        .then(() => {
          const len = instance.contextChatObjects.length;
          if (len > 0) {
            if (!instance.model.decodeObject.chatKey) {
              instance.model.chatKey = instance.contextChatObjects[len - 1].key;
            } else {
              instance.model.chatKey = instance.model.decodeObject.chatKey;
            }
            setSelectedModel(instance.model.chatKey);
            return;
          }
          return;
        })
        .catch(() => {
          //
        });
      instance.updateChatRecords();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (value: string) => {
      instance.handleModelNameChange(value);
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
          <div>
            <span>
              <Select
                value={selectedModel}
                style={{ minWidth: 160 }}
                onChange={handleChange}
                options={instance.sortedChatObjects.map(instance.toSelectionOption)}
                bordered={false}
                onFocus={async () => {
                  await instance.updateChatObjects();
                }}
              />
            </span>
            <span className="libro-prompt-cell-header-divider">
              <VariableNameInput
                value={instance.model.variableName}
                checkVariableNameAvailable={instance.checkVariableNameAvailable}
                handleVariableNameChange={instance.handleVariableNameChange}
              />
            </span>
          </div>
          <div>
            <ChatRecordInput
              value={instance.model.record}
              handleChange={instance.handleRecordChange}
              records={instance.chatRecords}
              onFocus={instance.updateChatRecords}
            />
            <span className="libro-prompt-cell-header-divider libro-prompt-cell-header-actions">
              <MessageOutlined
                className="libro-prompt-cell-header-chat"
                onClick={instance.openChatView}
              />
            </span>
          </div>
        </div>
        <CellEditor />
      </div>
    );
  },
);

@transient()
@view('prompt-editor-cell-view')
export class LibroPromptCellView extends LibroExecutableCellView {
  @inject(LirboContextKey) protected lirboContextKey: LirboContextKey;
  @inject(ChatHandler) protected chatHandler: ChatHandler;
  override view = PropmtEditorViewComponent;

  declare model: LibroPromptCellModel;

  // TODO: Chat objects and chat message records should belong to libro rather than cell
  @prop()
  contextChatObjects: ChatObject[] = [];

  @prop()
  contextChatRecords: string[] = [];

  get sortedChatObjects(): ChatObject[] {
    const map = new Map<string, ChatObject>();
    this.parent.model.cells.forEach((cell) => {
      if (cell.model instanceof LibroPromptCellModel && cell.model.chatKey) {
        map.set(cell.model.chatKey, ChatObjectFromKey(cell.model.chatKey));
      }
    });
    this.contextChatObjects.forEach((item) => {
      map.set(item.key, item);
    });
    return Array.from(map.values()).sort((a, b) => {
      if (a.disabled && !b.disabled) {
        return 1;
      }
      if (a.type !== b.type) {
        const aOrder = ChatObjectOptions(a.type).order || 0;
        const bOrder = ChatObjectOptions(b.type).order || 0;
        if (aOrder === bOrder && aOrder === 0) {
          return a.type.localeCompare(b.type);
        }
        return aOrder - bOrder;
      }
      return a.order - b.order;
    });
  }

  get chatRecords(): string[] {
    let records: string[] = [];
    const recordMap: Record<string, boolean> = {};
    this.parent.model.cells.forEach((cell) => {
      if (cell.model instanceof LibroPromptCellModel && cell.model.record) {
        records = records.concat(cell.model.record);
      }
    });
    return [...records, ...this.contextChatRecords]
      .filter((r) => {
        if (recordMap[r]) {
          return false;
        } else {
          recordMap[r] = true;
          return true;
        }
      })
      .sort((a, b) => a.localeCompare(b));
  }

  viewManager: ViewManager;

  @inject(CodeEditorManager) codeEditorManager: CodeEditorManager;
  @inject(PromptScript) promptScript: PromptScript;
  @inject(CommandRegistry) commands: CommandRegistry;

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

  updateChatObjects = async () => {
    const model = this.parent?.model as LibroJupyterModel;
    await model.kcReady;
    const connection = model.kernelConnection!;
    this.contextChatObjects = await this.chatHandler.getChatObjects(connection);
  };
  updateChatRecords = async () => {
    const model = this.parent?.model as LibroJupyterModel;
    await model.kcReady;
    const connection = model.kernelConnection!;
    this.contextChatRecords = await this.chatHandler.getChatRecordNames(connection);
  };

  toSelectionOption = (item: ChatObject) => {
    return {
      value: item.key,
      label: <SelectionItemLabel item={item} />,
      disabled: !!item.disabled,
    };
  };

  checkVariableNameAvailable = (variableName: string) => {
    return (
      this.parent.model.cells.findIndex(
        (cell) =>
          cell.model instanceof LibroPromptCellModel &&
          cell.model.variableName === variableName,
      ) > -1
    );
  };
  handleModelNameChange = (value: string) => {
    this.model.chatKey = value;
  };
  handleVariableNameChange = (value: string) => {
    this.model.variableName = value;
  };
  handleRecordChange = (value: string | undefined) => {
    this.model.record = value;
  };

  openChatView = async () => {
    this.commands.executeCommand(ChatCommands['Open'].id, {
      libroId: this.parent.id,
      cellId: this.id,
    });
  };
}
