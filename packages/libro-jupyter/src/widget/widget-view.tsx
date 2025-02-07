import type { JSONObject, JSONValue, IOutput, OutputType } from '@difizen/libro-common';
import type { CellView, LibroEditableExecutableCellView } from '@difizen/libro-core';
import { ExecutableCellView } from '@difizen/libro-core';
import { LibroContextKey } from '@difizen/libro-core';
import type { KernelMessage } from '@difizen/libro-kernel';
import {
  inject,
  transient,
  ViewOption,
  view,
  BaseView,
  prop,
  watch,
} from '@difizen/libro-common/mana-app';
import type { ViewComponent, Disposable } from '@difizen/libro-common/mana-app';
import { forwardRef } from 'react';

import { LibroJupyterModel } from '../libro-jupyter-model.js';

import { defaultWidgetState } from './protocol.js';
import type {
  Dict,
  IWidgets,
  IWidgetView,
  IClassicComm,
  ICallbacks,
  IWidgetViewProps,
  WidgetState,
} from './protocol.js';
import { LibroWidgetManager } from './widget-manager.js';

export const LibroWidgetComponent = forwardRef<HTMLDivElement>(
  function LibroWidgetComponent() {
    return <></>;
  },
);

@transient()
@view('libro-widget-view')
export class WidgetView extends BaseView implements IWidgetView {
  override view: ViewComponent = LibroWidgetComponent;
  libroContextKey: LibroContextKey;
  widgetsId: string;
  protected _msgHook: (msg: KernelMessage.IIOPubMessage) => boolean;

  @inject(LibroWidgetManager) libroWidgetManager: LibroWidgetManager;

  @prop()
  state: JSONObject & WidgetState = defaultWidgetState;

  cell?: LibroEditableExecutableCellView;

  get outputs() {
    if (this.cell) {
      return this.cell.outputArea;
    }
    return undefined;
  }

  disableCommandMode = true;

  toDisposeOnMsgChanged?: Disposable;

  constructor(
    @inject(ViewOption) props: IWidgetViewProps,
    @inject(LibroContextKey) libroContextKey: LibroContextKey,
  ) {
    super();
    this.widgetsId = props.widgetsId;
    const attributes = props.attributes;
    this.model_module = attributes._model_module;
    this.model_name = attributes._model_name;
    this.model_module_version = attributes._model_module_version;
    this.view_module = attributes._view_module;
    this.view_name = attributes._view_name;
    this.view_module_version = attributes._view_module_version;
    this.view_count = attributes._view_count;

    this._msgHook = (msg: KernelMessage.IIOPubMessage): boolean => {
      this.addFromMessage(msg);
      return false;
    };

    // Attributes should be initialized here, since user initialization may depend on it
    const comm = props.options.comm;
    if (comm) {
      // Remember comm associated with the model.
      this.comm = comm;

      // Hook comm messages up to model.
      comm.onClose(this.handleCommClosed.bind(this));
      comm.onMsg(this.handleCommMsg.bind(this));
    } else {
      this.isCommClosed = false;
    }
    this.model_id = props.options.model_id;

    this.state_change = Promise.resolve();
    this.setState(attributes);
    this.libroContextKey = libroContextKey;
  }

  setCell(cell: CellView) {
    if (ExecutableCellView.is(cell)) {
      this.cell = cell as LibroEditableExecutableCellView;
      if (this.cell) {
        this.cell.parentReady
          .then(() => {
            const notebookModel = this.cell?.parent.model;
            if (notebookModel instanceof LibroJupyterModel) {
              watch(notebookModel, 'kernelConnection', this.handleKernelChanged);
            }
            return;
          })
          .catch(console.error);
      }
    }
  }

  /**
   * Register a new kernel
   */
  handleKernelChanged = (): void => {
    this.setState({ msg_id: undefined });
  };

  /**
   * Reset the message id.
   */
  resetMsgId(): void {
    this.toDisposeOnMsgChanged?.dispose();
    const notebookModel = this.cell?.parent?.model;

    if (notebookModel instanceof LibroJupyterModel) {
      const kernel = notebookModel.kernelConnection;
      if (kernel && this.state['msg_id']) {
        this.toDisposeOnMsgChanged = kernel.registerMessageHook(
          this.state['msg_id'],
          this._msgHook,
        );
      }
    }
  }

  addFromMessage(msg: KernelMessage.IIOPubMessage) {
    const msgType = msg.header.msg_type;
    switch (msgType) {
      case 'execute_result':
      case 'display_data':
      case 'stream':
      case 'error': {
        const model = msg.content as IOutput;
        model.output_type = msgType as OutputType;
        this.outputs?.add(model);
        break;
      }
      case 'clear_output':
        this.clearOutput((msg as KernelMessage.IClearOutputMsg).content.wait);
        break;
      default:
        break;
    }
  }

  clearOutput(wait = false): void {
    this.outputs?.clear(wait);
  }

  override onViewMount() {
    this.widgets = this.libroWidgetManager.getWidgets(this.widgetsId)!;

    if (this.container && this.container.current && this.disableCommandMode) {
      this.container.current.addEventListener('focusin', () => {
        this.libroContextKey.disableCommandMode();
      });
      this.container.current.addEventListener('blur', (e) => {
        if (this.container?.current?.contains(e.relatedTarget as Node)) {
          this.libroContextKey.disableCommandMode();
        } else {
          this.libroContextKey.enableCommandMode();
        }
      });
    }
  }

  /**
   * Handle incoming comm msg.
   */
  handleCommMsg(msg: KernelMessage.ICommMsgMsg): Promise<void> {
    const data = msg.content.data as any;
    const method = data.method;
    switch (method) {
      case 'update':
      case 'echo_update':
        this.setState(data.state);
    }
    return Promise.resolve();
  }

  handleCommClosed = () => {
    this.isCommClosed = true;
  };
  /**
   * Handle when a widget is updated from the backend.
   *
   * This function is meant for internal use only. Values set here will not be propagated on a sync.
   */
  setState(state: Dict<any>): void {
    for (const key in state) {
      const oldMsgId = this.state['msg_id'];
      this.state[key] = state[key];
      if (key === 'msg_id' && oldMsgId !== state['msg_id']) {
        this.resetMsgId();
      }
    }
  }

  /**
   * Serialize the model.  See the deserialization function at the top of this file
   * and the kernel-side serializer/deserializer.
   */
  toJSON(): string {
    return this.toModelKey();
  }

  toModelKey(): string {
    return `IPY_MODEL_${this.model_id}`;
  }

  /**
   * Send a custom msg over the comm.
   */
  send = (
    data: JSONValue,
    callbacks?: ICallbacks,
    buffers?: ArrayBuffer[] | ArrayBufferView[],
  ) => {
    if (this.comm !== undefined) {
      return this.comm.send(data, callbacks, {}, buffers);
    }
    return undefined;
  };

  comm: IClassicComm;
  @prop() widgets?: IWidgets;
  model_id: string;
  state_change: Promise<any>;
  name: string;
  module: string;
  @prop()
  isCommClosed = false;

  model_module: string;
  model_name: string;
  model_module_version: string;
  view_module: string;
  view_name: string | null;
  view_module_version: string;
  view_count: number | null;
}
