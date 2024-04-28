import type { JSONValue } from '@difizen/libro-common';
import { LibroContextKey } from '@difizen/libro-core';
import type { KernelMessage } from '@difizen/libro-kernel';
import { inject, transient, ViewOption, view, BaseView, prop } from '@difizen/mana-app';
import type { ViewComponent } from '@difizen/mana-app';
import { forwardRef } from 'react';

import type { IWidgetViewProps } from './protocal.js';
import type {
  BufferJSON,
  Dict,
  IWidgets,
  IWidgetView,
  IClassicComm,
  ICallbacks,
} from './protocal.js';
import { assign } from './utils.js';
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
  @inject(LibroWidgetManager) libroWidgetManager: LibroWidgetManager;

  disableCommandMode = true;
  constructor(
    @inject(ViewOption) props: IWidgetViewProps,
    @inject(LibroContextKey) libroContextKey: LibroContextKey,
  ) {
    super();
    this.initialize(props);
    this.libroContextKey = libroContextKey;
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

  initialize(props: IWidgetViewProps): void {
    this.widgetsId = props.widgetsId;
    const attributes = props.attributes;
    this.model_module = attributes._model_module;
    this.model_name = attributes._model_name;
    this.model_module_version = attributes._model_module_version;
    this.view_module = attributes._view_module;
    this.view_name = attributes._view_name;
    this.view_module_version = attributes._view_module_version;
    this.view_count = attributes._view_count;

    // Attributes should be initialized here, since user initialization may depend on it
    const comm = props.options.comm;
    if (comm) {
      // Remember comm associated with the model.
      this.comm = comm;

      // Hook comm messages up to model.
      comm.on_close(this.handleCommClosed.bind(this));
      comm.on_msg(this.handleCommMsg.bind(this));
    } else {
      this.isCommClosed = false;
    }
    this.model_id = props.options.model_id;

    this.state_change = Promise.resolve();

    this.trySetValue(attributes, 'tabbable');
    this.trySetValue(attributes, 'tooltip');
  }

  protected trySetValue(attributes: any, propKey: keyof this) {
    if (propKey in attributes && attributes[propKey] !== undefined) {
      this[propKey] = attributes[propKey];
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
        // eslint-disable-next-line no-case-declarations
        const state: Dict<BufferJSON> = data.state;
        this.set_state(state);
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
  set_state(state: Dict<unknown>): void {
    assign(this, state);
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
      this.comm.send(data, callbacks, {}, buffers);
    }
  };

  comm: IClassicComm;
  @prop() widgets?: IWidgets;
  model_id: string;
  state_change: Promise<any>;
  name: string;
  module: string;
  isCommClosed = false;

  model_module: string;
  model_name: string;
  model_module_version: string;
  view_module: string;
  view_name: string | null;
  view_module_version: string;
  view_count: number | null;

  @prop() tabbable: boolean | null = null;
  @prop() tooltip: string | null = null;
}
