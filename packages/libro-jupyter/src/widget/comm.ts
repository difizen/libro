import type { JSONObject } from '@difizen/libro-common';
import type { IComm, IKernelConnection, IShellFuture } from '@difizen/libro-kernel';
import { inject, transient } from '@difizen/mana-app';

import type { ICallbacks, IClassicComm } from './protocol.js';
import { WidgetCommOption } from './protocol.js';

/**
 * Public constructor
 * @param  {IComm} jsServicesComm - @jupyterlab/services IComm instance
 */
@transient()
export class Comm implements IClassicComm {
  constructor(@inject(WidgetCommOption) options: WidgetCommOption) {
    this.jsServicesComm = options.comm;
  }

  /**
   * Comm id
   * @return {string}
   */
  get comm_id(): string {
    return this.jsServicesComm.commId;
  }

  /**
   * Target name
   * @return {string}
   */
  get target_name(): string {
    return this.jsServicesComm.targetName;
  }

  /**
   * Opens a sibling comm in the backend
   * @param  data
   * @param  callbacks
   * @param  metadata
   * @return msg id
   */
  open(
    data: JSONObject,
    callbacks?: ICallbacks,
    metadata?: JSONObject,
    buffers?: ArrayBuffer[] | ArrayBufferView[],
  ): string {
    const future = this.jsServicesComm.open(data, metadata, buffers);
    this._hookupCallbacks(future, callbacks);
    return future.msg.header.msg_id;
  }

  /**
   * Sends a message to the sibling comm in the backend
   * @param  data
   * @param  callbacks
   * @param  metadata
   * @param  buffers
   * @return message id
   */
  send(
    data: JSONObject,
    callbacks?: ICallbacks,
    metadata?: JSONObject,
    buffers?: ArrayBuffer[] | ArrayBufferView[],
  ): string {
    const future = this.jsServicesComm.send(data, metadata, buffers);
    this._hookupCallbacks(future, callbacks);
    return future.msg.header.msg_id;
  }

  /**
   * Closes the sibling comm in the backend
   * @param  data
   * @param  callbacks
   * @param  metadata
   * @return msg id
   */
  close(
    data?: JSONObject,
    callbacks?: ICallbacks,
    metadata?: JSONObject,
    buffers?: ArrayBuffer[] | ArrayBufferView[],
  ): string {
    const future = this.jsServicesComm.close(data, metadata, buffers);
    this._hookupCallbacks(future, callbacks);
    return future.msg.header.msg_id;
  }

  /**
   * Register a message handler
   * @param  callback, which is given a message
   */
  onMsg(callback: (x: any) => void): void {
    this.jsServicesComm.onMsg = callback.bind(this);
  }

  /**
   * Register a handler for when the comm is closed by the backend
   * @param  callback, which is given a message
   */
  onClose(callback: (x: any) => void): void {
    this.jsServicesComm.onClose = callback.bind(this);
  }

  /**
   * Hooks callback object up with @jupyterlab/services IKernelFuture
   * @param  @jupyterlab/services IKernelFuture instance
   * @param  callbacks
   */
  _hookupCallbacks(future: IShellFuture, callbacks?: ICallbacks): void {
    if (callbacks) {
      future.onReply = function (msg): void {
        if (callbacks.shell && callbacks.shell['reply']) {
          callbacks.shell['reply'](msg);
        }
      };

      future.onStdin = function (msg): void {
        if (callbacks.input) {
          callbacks.input(msg);
        }
      };

      future.onIOPub = function (msg): void {
        if (callbacks.iopub) {
          if (callbacks.iopub['status'] && msg.header.msg_type === 'status') {
            callbacks.iopub['status'](msg);
          } else if (
            callbacks.iopub['clear_output'] &&
            msg.header.msg_type === 'clear_output'
          ) {
            callbacks.iopub['clear_output'](msg);
          } else if (callbacks.iopub['output']) {
            switch (msg.header.msg_type) {
              case 'display_data':
              case 'execute_result':
              case 'stream':
              case 'error':
                callbacks.iopub['output'](msg);
                break;
              default:
                break;
            }
          }
        }
      };
    }
  }

  jsServicesComm: IComm;
  kernel: IKernelConnection;
}
