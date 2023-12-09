import type { CodeEditorViewOptions, IRange } from '@difizen/libro-code-editor';
import { CodeEditorView } from '@difizen/libro-code-editor';
import { CodeMirrorEditor, codeMirrorEditorFactory } from '@difizen/libro-codemirror';
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
import { Select } from 'antd';
import React, { useEffect, useState } from 'react';

import type { LibroPromptCellModel } from './prompt-cell-model.js';
import { PromptScript } from './prompt-cell-script.js';

export interface IModelSelectionItem {
  value: string;
  label: string;
}
export interface IModelItem {
  value: string;
}

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
        .fetch(
          { code: PromptScript.get_models, store_history: false },
          instance.handleQueryResponse,
        )
        .then(() => {
          if (instance.modelSelection.length > 0) {
            setSelectedModel(instance.modelSelection[0].label);
            (instance.model as LibroPromptCellModel).modelType =
              instance.modelSelection[0].label;
            return;
          }
          return;
        })
        .catch(() => {
          //
        });
    }, [instance]);

    const handleChange = (value: string) => {
      (instance.model as LibroPromptCellModel).modelType = value;
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
              options={instance.modelSelection}
              bordered={false}
              onFocus={async () => {
                await instance.fetch(
                  { code: PromptScript.get_models, store_history: false },
                  instance.handleQueryResponse,
                );
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
  override view = PropmtEditorViewComponent;

  @prop()
  modelSelection: IModelSelectionItem[] = [];

  viewManager: ViewManager;

  outputs: IOutput[];

  libroViewTracker: LibroViewTracker;

  @prop()
  editorView?: CodeEditorView;

  protected outputAreaDeferred = new Deferred<LibroOutputArea>();
  get outputAreaReady() {
    return this.outputAreaDeferred.promise;
  }

  protected editorViewReadyDeferred: Deferred<void> = new Deferred<void>();

  get editorReady() {
    return this.editorViewReadyDeferred.promise;
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
      factory: (editorOption) =>
        codeMirrorEditorFactory({
          ...editorOption,
          config: {
            ...editorOption.config,
            ...{ readOnly: this.parent.model.readOnly },
          },
        }),
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
    this.viewManager
      .getOrCreateView<CodeEditorView, CodeEditorViewOptions>(CodeEditorView, option)
      .then((editorView) => {
        this.editorView = editorView;
        this.editorViewReadyDeferred.resolve();
        watch(this.parent.model, 'readOnly', () => {
          this.editorView?.editor?.setOption('readOnly', this.parent.model.readOnly);
          if (this.editorView?.editor instanceof CodeMirrorEditor) {
            this.editorView?.editor.setOption('placeholder', '请输入代码');
          }
        });
        return;
      })
      .catch(() => {
        //
      });
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

  override focus = (toEdit: boolean) => {
    if (toEdit) {
      if (this.parent.model.readOnly === true) {
        return;
      }
      if (!this.editorView) {
        this.editorReady
          .then(async () => {
            await this.editorView?.editorReady;
            this.editorView?.editor?.setOption('styleActiveLine', true);
            this.editorView?.editor?.setOption('highlightActiveLineGutter', true);
            if (this.editorView?.editor?.hasFocus()) {
              return;
            }
            this.editorView?.editor?.focus();
            return;
          })
          .catch(() => {
            //
          });
      } else {
        if (!this.editorView?.editor) {
          return;
        }
        this.editorView.editor.setOption('styleActiveLine', true);
        this.editorView.editor.setOption('highlightActiveLineGutter', true);
        if (this.editorView.editor.hasFocus()) {
          return;
        }
        this.editorView.editor.focus();
      }
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

  override getSelections = (): [] => {
    return this.editor?.getSelections() as [];
  };

  override getSelectionsOffsetAt = (selection: IRange) => {
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

    // const cellContent = '%prompt ' + toBase64(this.model.value) + ',model:';
    const promptObj = {
      model_name: (this.model as LibroPromptCellModel).modelType || 'CodeGPT',
      prompt: this.model.value,
    };

    const cellContent = `%%prompt \n${JSON.stringify(promptObj)}`;

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
          (this.model as LibroPromptCellModel).kernelExecuting = true;
          startTimeStr = msg.header.date as string;
          const meta = (this.model as LibroPromptCellModel).metadata
            .execution as ExecutionMeta;
          if (meta) {
            meta['shell.execute_reply.started'] = startTimeStr;
          }
        }
        if (msg.header.msg_type === 'error') {
          (this.model as LibroPromptCellModel).hasExecutedError = true;
        }
      };

      const msgPromise = await future.done;
      this.model.executing = false;
      (this.model as LibroPromptCellModel).kernelExecuting = false;
      (this.model as LibroPromptCellModel).hasExecutedSuccess = !(
        this.model as LibroPromptCellModel
      ).hasExecutedError;

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
    const model = this.parent!.model! as LibroJupyterModel;
    await model.kcReady;
    const connection = model.kernelConnection!;
    const future = connection.requestExecute(content);
    future.onIOPub = (msg) => {
      ioCallback(msg);
    };
    return future.done as Promise<KernelMessage.IExecuteReplyMsg>;
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

        const update = JSON.parse(content) as string[];
        this.modelSelection = update.map((item) => {
          return { value: item, label: item };
        });
        break;
      }
      case 'stream': {
        const payloadDisplay = response as KernelMessage.IStreamMsg;
        let contentStream: string = payloadDisplay.content.text as string;
        if (contentStream.slice(0, 1) === "'" || contentStream.slice(0, 1) === '"') {
          contentStream = contentStream.slice(1, -1);
          contentStream = contentStream.replace(/\\"/g, '"').replace(/\\'/g, "'");
        }

        const updateStream = JSON.parse(contentStream) as string[];

        this.modelSelection = updateStream.map((item) => {
          return { value: item, label: item };
        });
        break;
      }
      default:
        break;
    }
  };
}
