import type { JSONPrimitive } from '@difizen/libro-common';
import { URL } from '@difizen/libro-common';
import { ServerConnection } from '@difizen/libro-kernel';
import type { Disposable, Disposed, Event } from '@difizen/libro-common/mana-app';
import { transient } from '@difizen/libro-common/mana-app';
import { Deferred } from '@difizen/libro-common/mana-app';
import { Emitter } from '@difizen/libro-common/mana-app';
import { inject } from '@difizen/libro-common/mana-app';

import { TerminalOption } from './protocol.js';
import type {
  TerminalMessage,
  TerminalModel,
  TerminalConnectionStatus,
  TerminalMessageType,
} from './protocol.js';
import { TerminalRestAPI } from './restapi.js';

@transient()
export class TerminalConnection implements Disposable, Disposed {
  protected _onDisposed = new Emitter<void>();
  protected _messageReceived = new Emitter<TerminalMessage>();
  protected _connectionStatus: TerminalConnectionStatus = 'connecting';
  protected _connectionStatusChanged = new Emitter<TerminalConnectionStatus>();
  protected _name: string;
  protected _reconnectTimeout?: NodeJS.Timeout = undefined;
  protected _ws?: WebSocket = undefined;
  protected _noOp = () => {
    /* no-op */
  };
  protected _reconnectLimit = 7;
  protected _reconnectAttempt = 0;
  protected _pendingMessages: TerminalMessage[] = [];
  @inject(TerminalRestAPI) terminalRestAPI: TerminalRestAPI;
  serverConnection: ServerConnection;

  disposed = false;

  /**
   * Construct a new terminal session.
   */
  constructor(
    @inject(TerminalOption) options: TerminalOption & { name: string },
    @inject(ServerConnection) serverConnection: ServerConnection,
  ) {
    this._name = options.name;
    this.serverConnection = serverConnection;
    this._createSocket();
  }

  /**
   * A signal emitted when a message is received from the server.
   */
  get messageReceived(): Event<TerminalMessage> {
    return this._messageReceived.event;
  }

  get onDisposed(): Event<void> {
    return this._onDisposed.event;
  }

  /**
   * Get the name of the terminal session.
   */
  get name(): string {
    return this._name;
  }

  /**
   * Get the model for the terminal session.
   */
  get model(): TerminalModel {
    return { name: this._name };
  }

  /**
   * The server settings for the session.
   */
  get serverSettings() {
    return this.serverConnection.settings;
  }

  /**
   * Dispose of the resources held by the session.
   */
  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.shutdown().catch(console.error);
    this._updateConnectionStatus('disconnected');
    this._clearSocket();
  }

  /**
   * Send a message to the terminal session.
   *
   * #### Notes
   * If the connection is down, the message will be queued for sending when
   * the connection comes back up.
   */
  send(message: TerminalMessage): void {
    this._sendMessage(message);
  }

  /**
   * Send a message on the websocket, or possibly queue for later sending.
   *
   * @param queue - whether to queue the message if it cannot be sent
   */
  _sendMessage(message: TerminalMessage, queue = true): void {
    if (this.disposed || !message.content) {
      return;
    }
    if (this.connectionStatus === 'connected' && this._ws) {
      const msg = [message.type, ...message.content];
      this._ws.send(JSON.stringify(msg));
    } else if (queue) {
      this._pendingMessages.push(message);
    } else {
      throw new Error(`Could not send message: ${JSON.stringify(message)}`);
    }
  }

  /**
   * Send pending messages to the kernel.
   */
  protected _sendPending(): void {
    // We check to make sure we are still connected each time. For
    // example, if a websocket buffer overflows, it may close, so we should
    // stop sending messages.
    while (this.connectionStatus === 'connected' && this._pendingMessages.length > 0) {
      this._sendMessage(this._pendingMessages[0], false);

      // We shift the message off the queue after the message is sent so that
      // if there is an exception, the message is still pending.
      this._pendingMessages.shift();
    }
  }

  toDisposeOnReconnect: Disposable | undefined;
  /**
   * Reconnect to a terminal.
   */
  reconnect = (): Promise<void> => {
    this._errorIfDisposed();
    const result = new Deferred<void>();

    // Set up a listener for the connection status changing, which accepts or
    // rejects after the retries are done.
    const fulfill = (status: TerminalConnectionStatus) => {
      if (status === 'connected') {
        result.resolve();
        this.toDisposeOnReconnect?.dispose();
      } else if (status === 'disconnected') {
        result.reject(new Error('Terminal connection disconnected'));
        this.toDisposeOnReconnect?.dispose();
      }
    };
    this.toDisposeOnReconnect = this.connectionStatusChanged(fulfill);

    // Reset the reconnect limit so we start the connection attempts fresh
    this._reconnectAttempt = 0;

    // Start the reconnection process, which will also clear any existing
    // connection.
    this._reconnect();

    // Return the promise that should resolve on connection or reject if the
    // retries don't work.
    return result.promise;
  };

  /**
   * Attempt a connection if we have not exhausted connection attempts.
   */
  _reconnect(): void {
    this._errorIfDisposed();

    // Clear any existing reconnection attempt
    clearTimeout(this._reconnectTimeout);

    // Update the connection status and schedule a possible reconnection.
    if (this._reconnectAttempt < this._reconnectLimit) {
      this._updateConnectionStatus('connecting');

      // The first reconnect attempt should happen immediately, and subsequent
      // attempts should pick a random number in a growing range so that we
      // don't overload the server with synchronized reconnection attempts
      // across multiple kernels.
      const timeout = getRandomIntInclusive(
        0,
        1e3 * (Math.pow(2, this._reconnectAttempt) - 1),
      );
      console.error(
        `Connection lost, reconnecting in ${Math.floor(timeout / 1000)} seconds.`,
      );
      this._reconnectTimeout = setTimeout(this._createSocket, timeout);
      this._reconnectAttempt += 1;
    } else {
      this._updateConnectionStatus('disconnected');
    }

    // Clear the websocket event handlers and the socket itself.
    this._clearSocket();
  }

  /**
   * Forcefully clear the socket state.
   *
   * #### Notes
   * This will clear all socket state without calling any handlers and will
   * not update the connection status. If you call this method, you are
   * responsible for updating the connection status as needed and recreating
   * the socket if you plan to reconnect.
   */
  protected _clearSocket(): void {
    if (this._ws) {
      // Clear the websocket event handlers and the socket itself.
      this._ws.onopen = this._noOp;
      this._ws.onclose = this._noOp;
      this._ws.onerror = this._noOp;
      this._ws.onmessage = this._noOp;
      this._ws.close();
      this._ws = undefined;
    }
  }

  /**
   * Shut down the terminal session.
   */
  async shutdown(): Promise<void> {
    await this.terminalRestAPI.shutdown(this.name, this.serverSettings);
    this.dispose();
  }

  /**
   * Create the terminal websocket connection and add socket status handlers.
   *
   * #### Notes
   * You are responsible for updating the connection status as appropriate.
   */
  protected _createSocket = () => {
    this._errorIfDisposed();

    // Make sure the socket is clear
    this._clearSocket();

    // Update the connection status to reflect opening a new connection.
    this._updateConnectionStatus('connecting');

    const name = this._name;
    const settings = this.serverSettings;

    let url = URL.join(
      settings.wsUrl,
      'terminals',
      'websocket',
      encodeURIComponent(name),
    );

    // If token authentication is in use.
    const token = settings.token;
    if (settings.appendToken && token !== '') {
      url = url + `?token=${encodeURIComponent(token)}`;
    }

    this._ws = new settings.WebSocket(url);

    this._ws.onmessage = this._onWSMessage;
    this._ws.onclose = this._onWSClose;
    this._ws.onerror = this._onWSClose as (
      this: WebSocket,
      ev: globalThis.Event,
    ) => any;
  };

  // Websocket messages events are defined as variables to bind `this`
  protected _onWSMessage = (event: MessageEvent) => {
    if (this.disposed) {
      return;
    }
    const data = JSON.parse(event.data) as JSONPrimitive[];

    // Handle a disconnect message.
    if (data[0] === 'disconnect') {
      this.dispose();
    }

    if (this._connectionStatus === 'connecting') {
      if (data[0] === 'setup') {
        this._updateConnectionStatus('connected');
      }
      return;
    }

    this._messageReceived.fire({
      type: data[0] as TerminalMessageType,
      content: data.slice(1),
    });
  };

  protected _onWSClose = (event: CloseEvent) => {
    console.warn(`Terminal websocket closed: ${event.code}`);
    if (!this.disposed) {
      this._reconnect();
    }
  };

  /**
   * Handle connection status changes.
   */
  protected _updateConnectionStatus(connectionStatus: TerminalConnectionStatus): void {
    if (this._connectionStatus === connectionStatus) {
      return;
    }

    this._connectionStatus = connectionStatus;

    // If we are not 'connecting', stop any reconnection attempts.
    if (connectionStatus !== 'connecting') {
      this._reconnectAttempt = 0;
      clearTimeout(this._reconnectTimeout);
    }

    // Send the pending messages if we just connected.
    if (connectionStatus === 'connected') {
      this._sendPending();
    }

    // Notify others that the connection status changed.
    this._connectionStatusChanged.fire(connectionStatus);
  }

  protected _errorIfDisposed() {
    if (this.disposed) {
      throw new Error('Terminal connection is disposed');
    }
  }

  get connectionStatusChanged(): Event<TerminalConnectionStatus> {
    return this._connectionStatusChanged.event;
  }

  get connectionStatus(): TerminalConnectionStatus {
    return this._connectionStatus;
  }
}

export function getRandomIntInclusive(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
