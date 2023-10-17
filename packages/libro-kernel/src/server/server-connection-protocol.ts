/**
 * A Jupyter server settings object.
 * Note that all of the settings are optional when passed to
 * [[makeSettings]].  The default settings are given in [[defaultSettings]].
 */
export interface ISettings {
  /**
   * The base url of the server.
   */
  readonly baseUrl: string;

  /**
   * The app url of the JupyterLab application.
   */
  readonly appUrl: string;

  /**
   * The base ws url of the server.
   */
  readonly wsUrl: string;

  /**
   * The default request init options.
   */
  readonly init: RequestInit;

  /**
   * The authentication token for requests.  Use an empty string to disable.
   */
  readonly token: string;

  /**
   * Whether to append a token to a Websocket url.  The default is `false` in the browser
   * and `true` in node or jest.
   */
  readonly appendToken: boolean;

  /**
   * The `fetch` method to use.
   */
  readonly fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;

  /**
   * The `Request` object constructor.
   */
  readonly Request: typeof Request;

  /**
   * The `Headers` object constructor.
   */
  readonly Headers: typeof Headers;

  /**
   * The `WebSocket` object constructor.
   */
  readonly WebSocket: typeof WebSocket;
}
