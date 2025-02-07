import { URL } from '@difizen/libro-common';
import type { ISettings } from '@difizen/libro-kernel';
import { createResponseError } from '@difizen/libro-kernel';
import { ServerConnection } from '@difizen/libro-kernel';
import { inject, singleton } from '@difizen/libro-common/app';

import type { TerminalModel, TerminalOption } from './protocol.js';

export const TERMINAL_SERVICE_URL = 'api/terminals';

@singleton()
export class TerminalRestAPI {
  @inject(ServerConnection) serverConnection: ServerConnection;

  async startNew(
    options: TerminalOption,
    serverSettings?: Partial<ISettings>,
  ): Promise<TerminalModel> {
    const settings = { ...this.serverConnection.settings, ...serverSettings };
    const url = URL.join(settings.baseUrl, TERMINAL_SERVICE_URL);
    const init = {
      method: 'POST',
      body: JSON.stringify(options),
    };
    const response = await this.serverConnection.makeRequest(url, init, settings);

    // 后端返回200
    if (response.status !== 200) {
      const err = await createResponseError(response);
      throw err;
    }
    const data = await response.json();
    return data;
  }

  async listRunning(serverSettings?: Partial<ISettings>): Promise<TerminalModel[]> {
    const settings = { ...this.serverConnection.settings, ...serverSettings };
    const url = URL.join(settings.baseUrl, TERMINAL_SERVICE_URL);
    const response = await this.serverConnection.makeRequest(url, {}, settings);
    if (response.status !== 200) {
      const err = await createResponseError(response);
      throw err;
    }
    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid Session list');
    }
    return data;
  }

  async shutdown(name: string, serverSettings?: Partial<ISettings>): Promise<void> {
    if (!name) {
      console.warn('No terminal name specified');
      return;
    }
    const settings = { ...this.serverConnection.settings, ...serverSettings };
    const url = URL.join(settings.baseUrl, TERMINAL_SERVICE_URL, name);

    const init = {
      method: 'DELETE',
    };
    const response = await this.serverConnection.makeRequest(url, init, settings);
    if (response.status === 404) {
      const data = await response.json();
      const msg =
        data.message ?? `The terminal session "${name}"" does not exist on the server`;
      console.warn(msg);
    } else {
      if (response.status !== 204) {
        const err = await createResponseError(response);
        throw err;
      }
    }
  }
}
