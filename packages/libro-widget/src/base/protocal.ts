import type { JSONObject, JSONValue } from '@difizen/libro-common';
import type { IComm, IKernelConnection, KernelMessage } from '@difizen/libro-kernel';
import { Syringe } from '@difizen/mana-app';

import type { WidgetView } from './widget-view.js';

export interface IWidgetViewOptions {
  model_id: string;
  comm: IClassicComm;
}

export interface IWidgetViewProps {
  attributes: any;
  options: IWidgetViewOptions;
}

/**
 * A simple dictionary type.
 */
export type Dict<T> = Record<string, T>;

export type BufferJSON =
  | { [property: string]: BufferJSON }
  | BufferJSON[]
  | string
  | number
  | boolean
  | null
  | ArrayBuffer
  | DataView;

export interface ISerializedState {
  state: JSONObject;
  buffers: ArrayBuffer[];
  buffer_paths: (string | number)[][];
}

/**
 * The widget manager interface exposed on the Widget instances
 */
export interface IWidgets {
  getModel: (model_id: string) => WidgetView;

  /**
   * Returns true if the given model is registered, otherwise false.
   *
   * #### Notes
   * This is a synchronous way to check if a model is registered.
   */
  hasModel: (model_id: string) => boolean;

  /**
   * Register a model instance promise with the manager.
   *
   * By registering the model, it can later be retrieved with `getModel`.
   */
  registerWidgetView: (model_id: string, model: Promise<WidgetView>) => void;

  newWidgetView: (attributes: any, options: IWidgetViewOptions) => Promise<WidgetView>;
}

export const LibroWidgetsFactory = Symbol('LibroWidgetsFactory');
export type LibroWidgetsFactory = (options: WidgetsOption) => IWidgets;
export const WidgetsOption = Symbol('WidgetsOption');
export interface WidgetsOption {
  kc: IKernelConnection;
  id: string;
}

export interface IWidgetView {
  initialize: (props: IWidgetViewProps) => void;
  toJSON: () => string;
  set_state: (state: Dict<unknown>) => void;
  handleCommMsg: (msg: KernelMessage.ICommMsgMsg) => Promise<void>;
  model_id: string;
  name: string;
  module: string;

  model_module: string;
  model_name: string;
  model_module_version: string;
  view_module: string;
  view_name: string | null;
  view_module_version: string;
  view_count: number | null;
}

export const IWidgetView = Symbol('IWidgetView');
export const WidgetViewContribution = Syringe.defineToken('WidgetViewContribution');
export interface WidgetViewContribution {
  canHandle: (attributes: any) => number;
  factory: (props: IWidgetViewProps) => Promise<WidgetView>;
}

export interface InstanceRecord {
  startDate: number;
  endDate: number;
}

interface Stage {
  name: string;
  backup_workers: number;
  terminated_workers: number;
  running_workers: number;
  total_workers: number;
  input_records: number;
  output_records: number;
  finished_percentage: number;
}

export interface Task {
  name: string;
  status: 'WAITING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SUSPENDED' | 'CANCELLED';
  stages: Stage[];
}

export interface ProgressInstance {
  id: string;
  status: 'Running' | 'Suspended' | 'Terminated';
  logview: string;
  tasks: Task[];
}

export interface ProgressItem {
  name: string;
  key: string;
  gen_time: string;
  logView: string;
  instances?: ProgressInstance[];
}

export type InstancesRecords = Record<string, InstanceRecord>;

/**
 * Callbacks for services shim comms.
 */
export interface ICallbacks {
  shell?: Record<string, (msg: KernelMessage.IShellMessage) => void>;
  iopub?: Record<string, (msg: KernelMessage.IIOPubMessage) => void>;
  input?: (msg: KernelMessage.IStdinMessage) => void;
}

export const LibroWidgetCommFactory = Symbol('LibroWidgetCommFactory');
export type LibroWidgetCommFactory = (options: WidgetCommOption) => IClassicComm;
export const WidgetCommOption = Symbol('WidgetCommOption');
export interface WidgetCommOption {
  comm: IComm;
}
export interface IClassicComm {
  /**
   * Comm id
   * @return {string}
   */
  comm_id: string;

  /**
   * Target name
   * @return {string}
   */
  target_name: string;

  /**
   * Opens a sibling comm in the backend
   * @param  data
   * @param  callbacks
   * @param  metadata
   * @param  buffers
   * @return msg id
   */
  open(
    data: JSONValue,
    callbacks?: ICallbacks,
    metadata?: JSONObject,
    buffers?: ArrayBuffer[] | ArrayBufferView[],
  ): string;

  /**
   * Sends a message to the sibling comm in the backend
   * @param  data
   * @param  callbacks
   * @param  metadata
   * @param  buffers
   * @return message id
   */
  send(
    data: JSONValue,
    callbacks?: ICallbacks,
    metadata?: JSONObject,
    buffers?: ArrayBuffer[] | ArrayBufferView[],
  ): string;

  /**
   * Closes the sibling comm in the backend
   * @param  data
   * @param  callbacks
   * @param  metadata
   * @param  buffers
   * @return msg id
   */
  close(
    data?: JSONValue,
    callbacks?: ICallbacks,
    metadata?: JSONObject,
    buffers?: ArrayBuffer[] | ArrayBufferView[],
  ): string;

  /**
   * Register a message handler
   * @param  callback, which is given a message
   */
  on_msg(callback: (x: any) => void): void;

  /**
   * Register a handler for when the comm is closed by the backend
   * @param  callback, which is given a message
   */
  on_close(callback: (x: any) => void): void;
}
