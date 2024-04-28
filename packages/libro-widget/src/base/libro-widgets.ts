import type { JSONObject } from '@difizen/libro-common';
import type { IKernelConnection, KernelMessage } from '@difizen/libro-kernel';
import type { Contribution } from '@difizen/mana-app';
import { contrib, inject, Priority, prop, transient } from '@difizen/mana-app';
import { Emitter } from '@difizen/mana-app';

import type { Comm } from './comm.js';
import type {
  ISerializedState,
  IWidgets,
  IWidgetViewOptions,
  IClassicComm,
  WidgetCommOption,
} from './protocal.js';
import {
  LibroWidgetCommFactory,
  WidgetsOption,
  WidgetViewContribution,
} from './protocal.js';
import { put_buffers, reject } from './utils.js';
import { PROTOCOL_VERSION } from './version.js';
import type { WidgetView } from './widget-view.js';

const PROTOCOL_MAJOR_VERSION = PROTOCOL_VERSION.split('.', 1)[0];

@transient()
export class LibroWidgets implements IWidgets {
  @contrib(WidgetViewContribution)
  WidgetViewProvider: Contribution.Provider<WidgetViewContribution>;
  widgetEmitter: Emitter<{ WidgetViewName: string }> = new Emitter();
  widgetCommFactory: (options: WidgetCommOption) => Comm;
  kernelConnection: IKernelConnection;

  constructor(
    @inject(WidgetsOption) options: WidgetsOption,
    @inject(LibroWidgetCommFactory)
    widgetCommFactory: (options: WidgetCommOption) => Comm,
  ) {
    this.kernelConnection = options.kc;
    this.id = options.id;
    this.widgetCommFactory = widgetCommFactory;
    this.kernelConnection.registerCommTarget(this.commTargetName, async (comm, msg) => {
      const widgetComm = this.widgetCommFactory({ comm });
      await this.handleCommOpen(widgetComm, msg);
    });
  }
  get onWidgetRender() {
    return this.widgetEmitter.event;
  }

  protected findProvider(attributes: any): WidgetViewContribution {
    const prioritized = Priority.sortSync(
      this.WidgetViewProvider.getContributions(),
      (contribution) => contribution.canHandle(attributes),
    );
    const sorted = prioritized.map((c) => c.value);
    return sorted[0]!;
  }

  /**
   * Create a comm which can be used for communication for a widget.
   *
   * If the data/metadata is passed in, open the comm before returning (i.e.,
   * send the comm_open message). If the data and metadata is undefined, we
   * want to reconstruct a comm that already exists in the kernel, so do not
   * open the comm by sending the comm_open message.
   *
   * @param comm_target_name Comm target name
   * @param model_id The comm id
   * @param data The initial data for the comm
   * @param metadata The metadata in the open message
   */
  async createComm(
    comm_target_name: string,
    model_id?: string,
    data?: JSONObject,
    metadata?: JSONObject,
    buffers?: ArrayBuffer[] | ArrayBufferView[],
  ): Promise<IClassicComm> {
    const kernel = this.kernelConnection;
    if (!kernel) {
      throw new Error('No current kernel');
    }
    const comm = kernel.createComm(comm_target_name, model_id);
    if (data || metadata) {
      comm.open(data, metadata, buffers);
    }
    return this.widgetCommFactory({ comm });
  }

  /**
   * Get a model by model id.
   *
   * #### Notes
   * If the model is not found, throw error.
   *
   * If you would like to synchronously test if a model exists, use .hasModel().
   */
  getModel(model_id: string): WidgetView {
    const model = this.models.get(model_id);
    if (model === undefined) {
      throw new Error('widget model not found');
    }
    return model;
  }

  /**
   * Returns true if the given model is registered, otherwise false.
   *
   * #### Notes
   * This is a synchronous way to check if a model is registered.
   */
  hasModel(model_id: string): boolean {
    return this.models.get(model_id) !== undefined;
  }

  /**
   * Handle when a comm is opened.
   */
  async handleCommOpen(
    comm: IClassicComm,
    msg: KernelMessage.ICommOpenMsg,
  ): Promise<WidgetView> {
    const protocolVersion = ((msg.metadata || {})['version'] as string) || '';
    if (protocolVersion.split('.', 1)[0] !== PROTOCOL_MAJOR_VERSION) {
      const error = `Wrong widget protocol version: received protocol version '${protocolVersion}', but was expecting major version '${PROTOCOL_MAJOR_VERSION}'`;
      console.error(error);
      return Promise.reject(error);
    }
    const data = msg.content.data as unknown as ISerializedState;
    const buffer_paths = data.buffer_paths || [];
    const buffers = msg.buffers || [];
    put_buffers(data.state, buffer_paths, buffers);
    // this.createComm(msg.content.target_name, msg.content.comm_id, msg.content.data, msg.metadata);
    return this.newWidgetView(data.state, {
      model_id: msg.content.comm_id,
      comm,
    }).catch(reject('Could not create a model.', true));
  }

  registerWidgetView(model_id: string, model: Promise<WidgetView>): void {
    model
      .then((model) => {
        this.models.set(model_id, model);
        this.models.set(model.toModelKey(), model);
        this.widgetEmitter.fire({ WidgetViewName: model.model_name });
        return;
      })
      .catch(() => {
        //
      });
  }

  handleCommClose(msg: KernelMessage.ICommCloseMsg) {
    const comm_id = msg.content.comm_id;
    const model = this.getModel(comm_id);
    model.isCommClosed = true;
  }

  unregisterWidgetView(model_id: string): void {
    const model = this.models.get(model_id);
    model?.dispose();
    this.models.delete(model_id);
  }

  async newWidgetView(
    attributes: any,
    options: IWidgetViewOptions,
  ): Promise<WidgetView> {
    const model_id = options.model_id;
    if (!model_id) {
      throw new Error(
        'Neither comm nor model_id provided in options object. At least one must exist.',
      );
    }
    options.model_id = model_id;
    const provider = this.findProvider(attributes);
    const WidgetView = provider.factory({
      attributes: attributes,
      options: options,
      widgetsId: this.id,
    });
    this.registerWidgetView(model_id, WidgetView);
    return WidgetView;
  }

  /**
   * Close all widgets and empty the widget state.
   * @return Promise that resolves when the widget state is cleared.
   */
  clearState() {
    this.models.clear();
  }
  /**
   * Disconnect the widget manager from the kernel, setting each model's comm
   * as dead.
   */
  disconnect(): void {
    // this.models.forEach(model => model.clear());
  }
  /**
   * Dictionary of model ids and model instance promises
   */
  @prop()
  protected models: Map<string, WidgetView> = new Map();

  /**
   * The comm target name to register
   */
  id: string;
  readonly commTargetName = 'jupyter.widget';

  /**
   * Serialize the model.  See the deserialization function at the top of this file
   * and the kernel-side serializer/deserializer.
   */
  toJSON(): string {
    return JSON.stringify({
      kc_id: this.kernelConnection.id,
      id: this.id,
    });
  }
}
