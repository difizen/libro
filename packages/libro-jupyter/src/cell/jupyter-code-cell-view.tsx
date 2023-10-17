import { CodeEditorView } from '@difizen/libro-code-editor';
import type {
  CodeEditorViewOptions,
  CompletionProvider,
  CompletionProviderOption,
  TooltipProvider,
  TooltipProviderOption,
} from '@difizen/libro-code-editor';
import { codeMirrorEditorFactory } from '@difizen/libro-codemirror';
import { CellEditorMemo, LibroCodeCellView } from '@difizen/libro-codemirror-code-cell';
import type { CellViewOptions } from '@difizen/libro-core';
import { CellService } from '@difizen/libro-core';
import { KernelError } from '@difizen/libro-kernel';
import { inject, transient } from '@difizen/mana-app';
import { view, ViewInstance, ViewManager, ViewOption } from '@difizen/mana-app';
import { getOrigin, useInject, watch } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { forwardRef } from 'react';

import { LibroJupyterModel } from '../libro-jupyter-model.js';
import type { ExecutionMeta } from '../libro-jupyter-protocol.js';

import type { JupyterCodeCellModel } from './jupyter-code-cell-model.js';

const JupyterCodeCellComponent = forwardRef<HTMLDivElement>(
  function JupyterCodeCellComponent(_props, ref) {
    const instance = useInject<JupyterCodeCellView>(ViewInstance);
    return (
      <div
        className={instance.className}
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
@view('jupyter-code-cell-view')
export class JupyterCodeCellView extends LibroCodeCellView {
  override view = JupyterCodeCellComponent;
  declare model: JupyterCodeCellModel;

  constructor(
    @inject(ViewOption) options: CellViewOptions,
    @inject(CellService) cellService: CellService,
    @inject(ViewManager) viewManager: ViewManager,
  ) {
    super(options, cellService, viewManager);
  }

  override clearExecution = () => {
    this.model.clearExecution();
    this.outputArea.clear();
  };

  override onViewMount() {
    const option: CodeEditorViewOptions = {
      ...this.options,
      factory: (editorOption) =>
        codeMirrorEditorFactory({
          ...editorOption,
          config: {
            ...editorOption.config,
            ...{ readOnly: this.parent.model.readOnly },
          },
        }),
      model: this.model,
      tooltipProvider: this.tooltipProvider,
      completionProvider: this.completionProvider,
      lspProvider: undefined,
    };
    this.viewManager
      .getOrCreateView<CodeEditorView, CodeEditorViewOptions>(CodeEditorView, option)
      .then((editorView) => {
        this.editorView = editorView;
        this.editorViewReadyDeferred.resolve();
        watch(this.parent.model, 'readOnly', () => {
          this.editorView?.editor?.setOption('readOnly', this.parent.model.readOnly);
        });
        this.editorView.onModalChange((val) => (this.hasModal = val));
        return;
      })
      .catch(() => {
        //
      });
  }

  tooltipProvider: TooltipProvider = async (option: TooltipProviderOption) => {
    const cellContent = this.model.value;
    const kernelConnection = getOrigin(
      (this.parent.model as LibroJupyterModel).kernelConnection,
    );
    if (!kernelConnection) {
      alert(l10n.t('Kernel Connection 还没有建立'));
      return null;
    }
    const reply = await kernelConnection.requestInspect({
      code: cellContent,
      cursor_pos: option.cursorPosition,
      detail_level: 1,
    });

    const value = reply.content;

    if (value.status !== 'ok' || !value.found) {
      return null;
    }
    return value.data['text/plain'] as string;
  };

  completionProvider: CompletionProvider = async (option: CompletionProviderOption) => {
    const cellContent = this.model.value;
    const kernelConnection = getOrigin(
      (this.parent.model as LibroJupyterModel).kernelConnection,
    );
    if (!kernelConnection) {
      alert(l10n.t('Kernel Connection 还没有建立'));
      throw new Error(l10n.t('Kernel Connection 还没有建立'));
    }
    const reply = await kernelConnection.requestComplete({
      code: cellContent,
      cursor_pos: option.cursorPosition,
    });

    const value = reply.content;

    if (value.status === 'abort') {
      throw new Error('abort');
    }

    if (value.status === 'error') {
      throw new Error(value.ename);
    }

    return {
      matches: value.matches,
      cursor_start: value.cursor_start,
      cursor_end: value.cursor_end,
      metadata: value.metadata,
    };
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
    const cellContent = this.model.value;
    const cellModel = this.model;

    try {
      this.clearExecution();
      const future = kernelConnection.requestExecute({
        code: cellContent,
      });

      let startTimeStr = '';
      cellModel.executing = true;

      cellModel.metadata['execution'] = {
        'shell.execute_reply.started': '',
        'shell.execute_reply.end': '',
        to_execute: new Date().toISOString(),
      } as ExecutionMeta;

      // Handle iopub messages
      future.onIOPub = (msg: any) => {
        cellModel.msgChangeEmitter.fire(msg);
        if (msg.header.msg_type === 'execute_input') {
          cellModel.kernelExecuting = true;
          startTimeStr = msg.header.date as string;
          const meta = cellModel.metadata['execution'] as ExecutionMeta;
          if (meta) {
            meta['shell.execute_reply.started'] = startTimeStr;
          }
        }
      };
      // Handle the execute reply.
      future.onReply = (msg: any) => {
        cellModel.msgChangeEmitter.fire(msg);
      };

      const msgPromise = await future.done;
      cellModel.executing = false;
      cellModel.kernelExecuting = false;

      startTimeStr = msgPromise.metadata['started'] as string;
      const endTimeStr = msgPromise.header.date;

      cellModel.metadata['execution']['shell.execute_reply.started'] = startTimeStr;
      cellModel.metadata['execution']['shell.execute_reply.end'] = endTimeStr;

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
}
