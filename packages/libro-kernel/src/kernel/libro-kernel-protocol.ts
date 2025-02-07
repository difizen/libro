/* eslint-disable @typescript-eslint/no-namespace */
import type { JSONObject } from '@difizen/libro-common';
import type { Event, Disposable } from '@difizen/libro-common/mana-app';

import type { ISpecModel } from '../kernelspec/index.js';
import type { ISettings } from '../server/index.js';

import type { LibroKernel } from './libro-kernel.js';
import type * as KernelMessage from './messages.js';

/**
 * A disposable object with an observable `disposed` signal.
 */
export interface ObservableDisposable extends Disposable {
  /**
   * A signal emitted when the object is disposed.
   */
  readonly onDisposed: Event<void>;
}

export type KernelStatus =
  | 'unknown'
  | 'starting'
  | 'idle'
  | 'busy'
  | 'terminating'
  | 'restarting'
  | 'autorestarting'
  | 'dead';

export interface KernelMeta {
  id: KernelId;
  name: string;
  last_activity: string;
  execution_state: KernelStatus;
  connections: number;
  readonly reason?: string;
  readonly traceback?: string;
}

export const KernelMetaOption = Symbol('KernelMetaOption');

export const KernelId = Symbol('LibroKernelId');
export type KernelId = string;

export const LibroKernelFactory = Symbol('LibroKernelFactory');
export type LibroKernelFactory = (kernel: KernelMeta) => LibroKernel;

export const LibroKernelConnectionFactory = Symbol('LibroKernelConnectionFactory');
export type LibroKernelConnectionFactory = (
  option: KernelConnectionOptions,
) => IKernelConnection;

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export class KernelError extends Error {
  /**
   * Exception name
   */
  readonly errorName: string;
  /**
   * Exception value
   */
  readonly errorValue: string;
  /**
   * Traceback
   */
  readonly traceback: string[];

  /**
   * Construct the kernel error.
   */
  constructor(content: KernelMessage.IExecuteReplyMsg['content']) {
    const errorContent = content as KernelMessage.IReplyErrorContent;
    const errorName = errorContent.ename;
    const errorValue = errorContent.evalue;
    super(`KernelReplyNotOK: ${errorName} ${errorValue}`);

    this.errorName = errorName;
    this.errorValue = errorValue;
    this.traceback = errorContent.traceback;
    Object.setPrototypeOf(this, KernelError.prototype);
  }
}

export interface IFuture<
  REQUEST extends KernelMessage.IShellControlMessage,
  REPLY extends KernelMessage.IShellControlMessage,
> extends Disposable {
  /**
   * The original outgoing message.
   */
  readonly msg: REQUEST;

  /**
   * A promise that resolves when the future is done.
   *
   * #### Notes
   * The future is done when there are no more responses expected from the
   * kernel.
   *
   * The `done` promise resolves to the reply message.
   */
  readonly done: Promise<REPLY>;

  /**
   * The reply handler for the kernel future.
   *
   * #### Notes
   * If the handler returns a promise, all kernel message processing pauses
   * until the promise is resolved. If there is a reply message, the future
   * `done` promise also resolves to the reply message after this handler has
   * been called.
   */
  onReply: (msg: REPLY) => void | PromiseLike<void>;

  /**
   * The iopub handler for the kernel future.
   *
   * #### Notes
   * If the handler returns a promise, all kernel message processing pauses
   * until the promise is resolved.
   */
  onIOPub: (msg: KernelMessage.IIOPubMessage) => void | PromiseLike<void>;

  /**
   * The stdin handler for the kernel future.
   *
   * #### Notes
   * If the handler returns a promise, all kernel message processing pauses
   * until the promise is resolved.
   */
  onStdin: (msg: KernelMessage.IStdinMessage) => void | PromiseLike<void>;

  /**
   * Register hook for IOPub messages.
   *
   * @param hook - The callback invoked for an IOPub message.
   *
   * #### Notes
   * The IOPub hook system allows you to preempt the handlers for IOPub
   * messages handled by the future.
   *
   * The most recently registered hook is run first. A hook can return a
   * boolean or a promise to a boolean, in which case all kernel message
   * processing pauses until the promise is fulfilled. If a hook return value
   * resolves to false, any later hooks will not run and the function will
   * return a promise resolving to false. If a hook throws an error, the error
   * is logged to the console and the next hook is run. If a hook is
   * registered during the hook processing, it will not run until the next
   * message. If a hook is removed during the hook processing, it will be
   * deactivated immediately.
   */
  registerMessageHook: (
    hook: (msg: KernelMessage.IIOPubMessage) => boolean | PromiseLike<boolean>,
  ) => void;

  /**
   * Remove a hook for IOPub messages.
   *
   * @param hook - The hook to remove.
   *
   * #### Notes
   * If a hook is removed during the hook processing, it will be deactivated immediately.
   */
  removeMessageHook: (
    hook: (msg: KernelMessage.IIOPubMessage) => boolean | PromiseLike<boolean>,
  ) => void;

  /**
   * Send an `input_reply` message.
   */
  sendInputReply: (
    content: KernelMessage.IInputReplyMsg['content'],
    parent_header: KernelMessage.IInputReplyMsg['parent_header'],
  ) => void;
}

export type IShellFuture<
  REQUEST extends KernelMessage.IShellMessage = KernelMessage.IShellMessage,
  REPLY extends KernelMessage.IShellMessage = KernelMessage.IShellMessage,
> = IFuture<REQUEST, REPLY>;

export type IControlFuture<
  REQUEST extends KernelMessage.IControlMessage = KernelMessage.IControlMessage,
  REPLY extends KernelMessage.IControlMessage = KernelMessage.IControlMessage,
> = IFuture<REQUEST, REPLY>;

export interface IComm extends Disposable {
  /**
   * The unique id for the comm channel.
   */
  readonly commId: string;

  /**
   * The target name for the comm channel.
   */
  readonly targetName: string;

  /**
   * Callback for a comm close event.
   *
   * #### Notes
   * This is called when the comm is closed from either the server or client.
   * If this is called in response to a kernel message and the handler returns
   * a promise, all kernel message processing pauses until the promise is
   * resolved.
   */
  onClose: (msg: KernelMessage.ICommCloseMsg) => void | PromiseLike<void>;

  /**
   * Callback for a comm message received event.
   *
   * #### Notes
   * If the handler returns a promise, all kernel message processing pauses
   * until the promise is resolved.
   */
  onMsg: (msg: KernelMessage.ICommMsgMsg) => void | PromiseLike<void>;

  /**
   * Open a comm with optional data and metadata.
   *
   * @param data - The data to send to the server on opening.
   *
   * @param metadata - Additional metadata for the message.
   *
   * @returns A future for the generated message.
   *
   * #### Notes
   * This sends a `comm_open` message to the server.
   */
  open: (
    data?: JSONObject,
    metadata?: JSONObject,
    buffers?: (ArrayBuffer | ArrayBufferView)[],
  ) => IShellFuture;

  /**
   * Send a `comm_msg` message to the kernel.
   *
   * @param data - The data to send to the server on opening.
   *
   * @param metadata - Additional metadata for the message.
   *
   * @param buffers - Optional buffer data.
   *
   * @param disposeOnDone - Whether to dispose of the future when done.
   *
   * @returns A future for the generated message.
   *
   * #### Notes
   * This is a no-op if the comm has been closed.
   */
  send: (
    data: JSONObject,
    metadata?: JSONObject,
    buffers?: (ArrayBuffer | ArrayBufferView)[],
    disposeOnDone?: boolean,
  ) => IShellFuture;

  /**
   * Close the comm.
   *
   * @param data - The data to send to the server on opening.
   *
   * @param metadata - Additional metadata for the message.
   *
   * @returns A future for the generated message.
   *
   * #### Notes
   * This will send a `comm_close` message to the kernel, and call the
   * `onClose` callback if set.
   *
   * This is a no-op if the comm is already closed.
   */
  close: (
    data?: JSONObject,
    metadata?: JSONObject,
    buffers?: (ArrayBuffer | ArrayBufferView)[],
  ) => IShellFuture;
}

export interface IAnyMessageArgs {
  /**
   * The message that is being signaled.
   */
  msg: Readonly<KernelMessage.IMessage>;

  /**
   * The direction of the message.
   */
  direction: 'send' | 'recv';
}

export interface IKernelModel {
  /**
   * Unique identifier of the kernel on the server.
   */
  readonly id: string;

  /**
   * The name of the kernel.
   */
  readonly name: string;

  /**
   * The kernel execution state.
   */
  readonly execution_state?: string;

  /**
   * The timestamp of the last activity on the kernel.
   */
  // eslint-disable-next-line camelcase
  readonly last_activity?: string;

  /**
   * The number of active connections to the kernel.
   */
  readonly connections?: number;

  /**
   * The reason the kernel died, if applicable.
   */
  readonly reason?: string;

  /**
   * The traceback for a dead kernel, if applicable.
   */
  readonly traceback?: string;
}

export interface IKernelConnection extends ObservableDisposable {
  /**
   * The id of the server-side kernel.
   */
  readonly id: string;

  /**
   * The name of the server-side kernel.
   */
  readonly name: string;

  /**
   * The kernel model, for convenience.
   */
  readonly model: IKernelModel;

  /**
   * The client username.
   */
  readonly username: string;

  /**
   * The client unique id.
   *
   * #### Notes
   * This should be unique for a particular kernel connection object.
   */
  readonly clientId: string;

  /**
   * The current status of the kernel.
   */
  readonly status: KernelMessage.Status;

  /**
   * The current connection status of the kernel.
   */
  readonly connectionStatus: ConnectionStatus;

  readonly isDisposed: boolean;

  /**
   * The kernel info
   *
   * #### Notes
   * This promise only resolves at startup, and is not refreshed on every
   * restart.
   */
  readonly info: Promise<KernelMessage.IInfoReply>;

  /**
   * Get the kernel spec.
   *
   * @returns A promise that resolves with the kernel spec for this kernel.
   *
   * #### Notes
   * This may make a server request to retrieve the spec.
   */
  readonly spec?: Promise<ISpecModel | undefined>;

  /**
   * Whether the kernel connection handles comm messages.
   *
   * #### Notes
   * The comm message protocol currently has implicit assumptions that only
   * one kernel connection is handling comm messages. This option allows a
   * kernel connection to opt out of handling comms.
   *
   * See https://github.com/jupyter/jupyter_client/issues/263
   */
  handleComms: boolean;

  /**
   * Whether the kernel connection has pending input.
   *
   * #### Notes
   * This is a guard to avoid deadlock is the user asks input
   * as second time before submitting his first input
   */
  hasPendingInput: boolean;

  /**
   * Send a shell message to the kernel.
   *
   * @param msg - The fully-formed shell message to send.
   *
   * @param expectReply - Whether to expect a shell reply message.
   *
   * @param disposeOnDone - Whether to dispose of the future when done.
   *
   * #### Notes
   * Send a message to the kernel's shell channel, yielding a future object
   * for accepting replies.
   *
   * If `expectReply` is given and `true`, the future is done when both a
   * shell reply and an idle status message are received with the appropriate
   * parent header, in which case the `.done` promise resolves to the reply.
   * If `expectReply` is not given or is `false`, the future is done when an
   * idle status message with the appropriate parent header is received, in
   * which case the `.done` promise resolves to `undefined`.
   *
   * If `disposeOnDone` is given and `false`, the future will not be disposed
   * of when the future is done, instead relying on the caller to dispose of
   * it. This allows for the handling of out-of-order output from ill-behaved
   * kernels.
   *
   * All replies are validated as valid kernel messages.
   *
   * If the kernel status is `'dead'`, this will throw an error.
   */
  sendShellMessage: <T extends KernelMessage.ShellMessageType>(
    msg: KernelMessage.IShellMessage<T>,
    expectReply?: boolean,
    disposeOnDone?: boolean,
  ) => IShellFuture<KernelMessage.IShellMessage<T>>;

  sendControlMessage: <T extends KernelMessage.ControlMessageType>(
    msg: KernelMessage.IControlMessage<T>,
    expectReply?: boolean,
    disposeOnDone?: boolean,
  ) => IControlFuture<KernelMessage.IControlMessage<T>>;

  /**
   * Reconnect to a disconnected kernel.
   *
   * @returns A promise that resolves when the kernel has reconnected.
   *
   * #### Notes
   * This just refreshes the connection to an existing kernel, and does not
   * perform an HTTP request to the server or restart the kernel.
   */
  reconnect: () => Promise<void>;

  /**
   * Interrupt a kernel.
   *
   * @returns A promise that resolves when the kernel has interrupted.
   *
   * #### Notes
   * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels).
   *
   * The promise is fulfilled on a valid response and rejected otherwise.
   *
   * It is assumed that the API call does not mutate the kernel id or name.
   *
   * The promise will be rejected if the kernel status is `'dead'` or if the
   * request fails or the response is invalid.
   */
  interrupt: () => Promise<void>;

  /**
   * Restart a kernel.
   *
   * @returns A promise that resolves when the kernel has restarted.
   *
   * #### Notes
   * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels) and validates the response model.
   *
   * Any existing Future or Comm objects are cleared.
   *
   * It is assumed that the API call does not mutate the kernel id or name.
   *
   * The promise will be rejected if the kernel status is `'dead'` or if the
   * request fails or the response is invalid.
   */
  restart: () => Promise<void>;

  /**
   * Send a `kernel_info_request` message.
   *
   * @param content - The content of the request.
   *
   * @returns A promise that resolves with the response message.
   *
   * #### Notes
   * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#kernel-info).
   *
   * Fulfills with the `kernel_info_response` content when the shell reply is
   * received and validated.
   */
  requestKernelInfo?: () => Promise<KernelMessage.IInfoReplyMsg | undefined>;

  /**
   * Send a `complete_request` message.
   *
   * @param content - The content of the request.
   *
   * @returns A promise that resolves with the response message.
   *
   * #### Notes
   * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#completion).
   *
   * Fulfills with the `complete_reply` content when the shell reply is
   * received and validated.
   */
  requestComplete: (
    content: KernelMessage.ICompleteRequestMsg['content'],
  ) => Promise<KernelMessage.ICompleteReplyMsg>;

  /**
   * Send an `inspect_request` message.
   *
   * @param content - The content of the request.
   *
   * @returns A promise that resolves with the response message.
   *
   * #### Notes
   * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#introspection).
   *
   * Fulfills with the `inspect_reply` content when the shell reply is
   * received and validated.
   */
  requestInspect: (
    content: KernelMessage.IInspectRequestMsg['content'],
  ) => Promise<KernelMessage.IInspectReplyMsg>;

  /**
   * Send a `history_request` message.
   *
   * @param content - The content of the request.
   *
   * @returns A promise that resolves with the response message.
   *
   * #### Notes
   * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#history).
   *
   * Fulfills with the `history_reply` content when the shell reply is
   * received and validated.
   */
  requestHistory: (
    content: KernelMessage.IHistoryRequestMsg['content'],
  ) => Promise<KernelMessage.IHistoryReplyMsg>;

  /**
   * Send an `execute_request` message.
   *
   * @param content - The content of the request.
   *
   * @param disposeOnDone - Whether to dispose of the future when done.
   *
   * @returns A kernel future.
   *
   * #### Notes
   * See [Messaging in
   * Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#execute).
   *
   * This method returns a kernel future, rather than a promise, since execution may
   * have many response messages (for example, many iopub display messages).
   *
   * Future `onReply` is called with the `execute_reply` content when the
   * shell reply is received and validated.
   *
   * **See also:** [[IExecuteReply]]
   */
  requestExecute: (
    content: KernelMessage.IExecuteRequestMsg['content'],
    disposeOnDone?: boolean,
    metadata?: JSONObject,
  ) => IShellFuture<KernelMessage.IExecuteRequestMsg, KernelMessage.IExecuteReplyMsg>;

  /**
   * Send an experimental `debug_request` message.
   *
   * @hidden
   *
   * @param content - The content of the request.
   *
   * @param disposeOnDone - Whether to dispose of the future when done.
   *
   * @returns A kernel future.
   *
   * #### Notes
   * Debug messages are experimental messages that are not in the official
   * kernel message specification. As such, this function is *NOT* considered
   * part of the public API, and may change without notice.
   */
  requestDebug: (
    content: KernelMessage.IDebugRequestMsg['content'],
    disposeOnDone?: boolean,
  ) => IControlFuture<KernelMessage.IDebugRequestMsg, KernelMessage.IDebugReplyMsg>;

  /**
   * Send an `is_complete_request` message.
   *
   * @param content - The content of the request.
   *
   * @returns A promise that resolves with the response message.
   *
   * #### Notes
   * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#code-completeness).
   *
   * Fulfills with the `is_complete_response` content when the shell reply is
   * received and validated.
   */
  requestIsComplete: (
    content: KernelMessage.IIsCompleteRequestMsg['content'],
  ) => Promise<KernelMessage.IIsCompleteReplyMsg>;

  /**
   * Send a `comm_info_request` message.
   *
   * @param content - The content of the request.
   *
   * @returns A promise that resolves with the response message.
   *
   * #### Notes
   * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#comm_info).
   *
   * Fulfills with the `comm_info_reply` content when the shell reply is
   * received and validated.
   */
  requestCommInfo: (
    content: KernelMessage.ICommInfoRequestMsg['content'],
  ) => Promise<KernelMessage.ICommInfoReplyMsg>;

  /**
   * Send an `input_reply` message.
   *
   * @param content - The content of the reply.
   *
   * #### Notes
   * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#messages-on-the-stdin-router-dealer-sockets).
   */
  sendInputReply: (
    content: KernelMessage.IInputReplyMsg['content'],
    parent_header: KernelMessage.IInputReplyMsg['parent_header'],
  ) => void;

  /**
   * Create a new comm.
   *
   * @param targetName - The name of the comm target.
   *
   * @param id - The comm id.
   *
   * @returns A comm instance.
   */
  createComm: (targetName: string, commId?: string) => IComm;

  /**
   * Check if a comm exists.
   */
  hasComm: (commId: string) => boolean;

  /**
   * Register a comm target handler.
   *
   * @param targetName - The name of the comm target.
   *
   * @param callback - The callback invoked for a comm open message.
   *
   * #### Notes
   * Only one comm target can be registered to a target name at a time, an
   * existing callback for the same target name will be overridden.  A registered
   * comm target handler will take precedence over a comm which specifies a
   * `target_module`.
   *
   * If the callback returns a promise, kernel message processing will pause
   * until the returned promise is fulfilled.
   */
  registerCommTarget: (
    targetName: string,
    callback: (
      comm: IComm,
      msg: KernelMessage.ICommOpenMsg,
    ) => void | PromiseLike<void>,
  ) => void;

  /**
   * Remove a comm target handler.
   *
   * @param targetName - The name of the comm target to remove.
   *
   * @param callback - The callback to remove.
   *
   * #### Notes
   * The comm target is only removed if it matches the callback argument.
   */
  removeCommTarget: (
    targetName: string,
    callback: (
      comm: IComm,
      msg: KernelMessage.ICommOpenMsg,
    ) => void | PromiseLike<void>,
  ) => void;

  /**
   * Register an IOPub message hook.
   *
   * @param msg_id - The parent_header message id in messages the hook should
   * intercept.
   *
   * @param hook - The callback invoked for the message.
   *
   * #### Notes
   * The IOPub hook system allows you to preempt the handlers for IOPub
   * messages with a given parent_header message id. The most recently
   * registered hook is run first. If a hook return value resolves to false,
   * any later hooks and the future's onIOPub handler will not run. If a hook
   * throws an error, the error is logged to the console and the next hook is
   * run. If a hook is registered during the hook processing, it will not run
   * until the next message. If a hook is disposed during the hook processing,
   * it will be deactivated immediately.
   *
   * See also [[IFuture.registerMessageHook]].
   */
  registerMessageHook: (
    msgId: string,
    hook: (msg: KernelMessage.IIOPubMessage) => boolean | PromiseLike<boolean>,
  ) => Disposable;

  /**
   * Remove an IOPub message hook.
   *
   * @param msg_id - The parent_header message id the hook intercepted.
   *
   * @param hook - The callback invoked for the message.
   *
   */
  removeMessageHook: (
    msgId: string,
    hook: (msg: KernelMessage.IIOPubMessage) => boolean | PromiseLike<boolean>,
  ) => void;

  /**
   * Remove the input guard, if any.
   */
  removeInputGuard: () => void;

  /**
   * A signal emitted when the kernel status changes.
   */
  statusChanged: Event<KernelMessage.Status>;

  /**
   * A signal emitted when the kernel connection status changes.
   */
  connectionStatusChanged: Event<ConnectionStatus>;

  /**
   * A signal emitted after an iopub kernel message is handled.
   */
  iopubMessage: Event<KernelMessage.IIOPubMessage>;

  futureMessage: Event<KernelMessage.IMessage<KernelMessage.MessageType>>;
  /**
   * A signal emitted for unhandled non-iopub kernel messages that claimed to
   * be responses for messages we sent using this kernel object.
   */
  unhandledMessage: Event<KernelMessage.IMessage>;

  /**
   * A signal emitted when any kernel message is sent or received.
   *
   * #### Notes
   * This signal is emitted before any message handling has happened. The
   * message should be treated as read-only.
   */
  anyMessage: Event<IAnyMessageArgs>;

  /**
   * A signal emitted when a kernel has pending inputs from the user.
   */
  pendingInput: Event<boolean>;

  /**
   * The server settings for the kernel.
   */
  readonly serverSettings: ISettings;

  /**
   * Shutdown a kernel.
   *
   * @returns A promise that resolves when the kernel has shut down.
   *
   * #### Notes
   * Uses the [Jupyter Notebook
   * API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels).
   *
   * On a valid response, closes the websocket, disposes of the kernel
   * object, and fulfills the promise.
   *
   * The promise will be rejected if the kernel status is `'dead'`, the
   * request fails, or the response is invalid.
   */
  shutdown: () => Promise<void>;

  /**
   * Clone the current kernel with a new clientId.
   */
  clone: (
    options?: Pick<KernelConnectionOptions, 'clientId' | 'username' | 'handleComms'>,
  ) => IKernelConnection;
}

export const KernelConnectionOptions = Symbol('IOptions');
export interface KernelConnectionOptions {
  /**
   * The kernel model.
   */
  model: IKernelModel;

  /**
   * The server settings for the kernel.
   */
  serverSettings?: Partial<ISettings>;

  /**
   * The username of the kernel client.
   */
  username?: string;

  /**
   * Whether the kernel connection should handle comm messages
   *
   * #### Notes
   * The comm message protocol currently has implicit assumptions that only
   * one kernel connection is handling comm messages. This option allows a
   * kernel connection to opt out of handling comms.
   *
   * See https://github.com/jupyter/jupyter_client/issues/263
   */
  handleComms?: boolean;

  /**
   * The unique identifier for the kernel client.
   */
  clientId?: string;
}
