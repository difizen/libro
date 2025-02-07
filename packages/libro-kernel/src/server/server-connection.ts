import { URL } from '@difizen/libro-common';
import { isNative, isWeb, prop, singleton } from '@difizen/libro-common/mana-app';

import { PageConfig } from '../page-config.js';

import { NetworkError } from './connection-error.js';
import type { ISettings } from './server-connection-protocol.js';

let FETCH: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
let HEADERS: typeof Headers;
let REQUEST: typeof Request;
let WEBSOCKET: typeof WebSocket;

if (isNative) {
  // node environment
} else {
  FETCH = window.fetch;
  REQUEST = window.Request;
  HEADERS = window.Headers;
  WEBSOCKET = window.WebSocket;
}

@singleton()
export class ServerConnection {
  @prop()
  settings: ISettings;

  constructor() {
    this.updateSettings({});
  }

  updateSettings(options: Partial<ISettings> = {}): ISettings {
    const pageBaseUrl = PageConfig.getBaseUrl();
    const pageWsUrl = PageConfig.getWsUrl();
    let baseUrl = URL.normalize(options.baseUrl) || pageBaseUrl;
    if (!baseUrl) {
      baseUrl = window.location.origin + '/';
    } else if (baseUrl.startsWith('/')) {
      baseUrl = window.location.origin + baseUrl;
    }
    let wsUrl = options.wsUrl || pageWsUrl;
    if (wsUrl.startsWith('/')) {
      wsUrl = 'ws' + (window.location.origin + wsUrl).slice(4);
    }
    // Otherwise convert the baseUrl to a wsUrl if possible.
    if (!wsUrl && baseUrl.indexOf('http') === 0) {
      wsUrl = 'ws' + baseUrl.slice(4);
    }
    // Otherwise fall back on the default wsUrl.
    wsUrl = wsUrl ?? pageWsUrl;

    this.settings = {
      init: { cache: 'no-store', credentials: 'same-origin' },
      fetch: FETCH,
      Headers: HEADERS,
      Request: REQUEST,
      WebSocket: WEBSOCKET,
      token: PageConfig.getToken(),
      appUrl: PageConfig.getOption('appUrl'),
      appendToken:
        !isWeb ||
        (isNative && process?.env?.['JEST_WORKER_ID'] !== undefined) ||
        URL.getHostName(pageBaseUrl) !== URL.getHostName(wsUrl),
      ...options,
      baseUrl,
      wsUrl,
    };
    PageConfig.setOption('baseUrl', baseUrl);
    return this.settings;
  }

  /**
   * Handle a request.
   *
   * @param url - The url for the request.
   *
   * @param init - The overrides for the request init.
   *
   * @param settings - The settings object for the request.
   *
   * #### Notes
   * The `url` must start with `settings.baseUrl`.  The `init` settings
   * take precedence over `settings.init`.
   */
  makeRequest(
    baseUrl: string,
    init: RequestInit,
    settings: ISettings = this.settings,
  ): Promise<Response> {
    let url = baseUrl;
    // Handle notebook server requests.
    if (url.indexOf(settings.baseUrl) !== 0) {
      throw new Error('Can only be used for notebook server requests');
    }

    // Use explicit cache buster when `no-store` is set since
    // not all browsers use it properly.
    const cache = init.cache ?? settings.init.cache;
    if (cache === 'no-store') {
      // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
      url += (/\?/.test(url) ? '&' : '?') + new Date().getTime();
    }

    const request = new settings.Request(url, { ...settings.init, ...init });

    // Handle authentication. Authentication can be overdetermined by
    // settings token and XSRF token.
    let authenticated = false;
    if (settings.token) {
      authenticated = true;
      request.headers.append('Authorization', `token ${settings.token}`);
    }
    if (typeof document !== 'undefined' && document?.cookie) {
      const xsrfToken = this.getCookie('_xsrf');
      if (xsrfToken !== undefined) {
        authenticated = true;
        request.headers.append('X-XSRFToken', xsrfToken);
      }
    }

    // Set the content type if there is no given data and we are
    // using an authenticated connection.
    if (!request.headers.has('Content-Type') && authenticated) {
      request.headers.set('Content-Type', 'application/json');
    }

    // Use `call` to avoid a `TypeError` in the browser.
    return settings.fetch.call(null, request).catch((e: TypeError) => {
      // Convert the TypeError into a more specific error.
      throw new NetworkError(e);
    });
    // TODO: *this* is probably where we need a system-wide connectionFailure
    // signal we can hook into.
  }

  /**
   * Get a cookie from the document.
   */
  getCookie(name: string): string | undefined {
    // From http://www.tornadoweb.org/en/stable/guide/security.html
    const matches = document.cookie.match('\\b' + name + '=([^;]*)\\b');
    return matches?.[1];
  }
}
