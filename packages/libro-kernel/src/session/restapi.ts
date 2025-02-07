// import { default as axios } from 'axios';
import { URL } from '@difizen/libro-common';
import { inject, singleton } from '@difizen/libro-common/app';

import type { ISettings } from '../server/index.js';
import { createResponseError } from '../server/index.js';
import { ServerConnection } from '../server/server-connection.js';

import type {
  ISessionOptions,
  SessionIModel,
  SessionMeta,
} from './libro-session-protocol.js';
import { updateLegacySessionModel, validateModel } from './validate.js';

export const SESSION_SERVICE_URL = 'api/sessions';

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

/**
 * Get a session url.
 */
export function getSessionUrl(baseUrl: string, id: string): string {
  return URL.join(baseUrl, SESSION_SERVICE_URL, id);
}

@singleton()
export class SessionRestAPI {
  @inject(ServerConnection) serverConnection: ServerConnection;

  // async startNewSession(params: {
  //   fileName: string;
  //   kernelName: string;
  //   path: string;
  //   type: string;
  // }) {
  //   try {
  //     const res = await axios.post(`/api/sessions`, {
  //       kernel: { name: params.kernelName }, // 来源于当前文件选择了哪一个kernel，名称来自于kernelspecs
  //       name: params.fileName,
  //       path: params.path,
  //       type: params.type,
  //     });
  //     if (res.status === 201 && res.data) {
  //       return res.data;
  //     }
  //   } catch (ex) {
  //     return undefined;
  //   }
  // }

  /**
   * Create a new session, or return an existing session if the session path
   * already exists.
   */
  async startSession(
    options: ISessionOptions,
    serverSettings?: Partial<ISettings>,
  ): Promise<SessionIModel> {
    const settings = { ...this.serverConnection.settings, ...serverSettings };
    const url = URL.join(settings.baseUrl, SESSION_SERVICE_URL);
    const init = {
      method: 'POST',
      body: JSON.stringify(options),
    };
    const response = await this.serverConnection.makeRequest(url, init, settings);

    if (response.status !== 201) {
      const err = await createResponseError(response);
      throw err;
    }
    const data = await response.json();
    updateLegacySessionModel(data);
    validateModel(data);
    return data;
  }

  /**
   * List the running sessions.
   */
  async listRunning(serverSettings?: Partial<ISettings>): Promise<SessionMeta[]> {
    const settings = { ...this.serverConnection.settings, ...serverSettings };
    const url = URL.join(settings.baseUrl, SESSION_SERVICE_URL);
    const response = await this.serverConnection.makeRequest(url, {}, settings);
    if (response.status !== 200) {
      const err = await createResponseError(response);
      throw err;
    }
    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid Session list');
    }
    data.forEach((m) => {
      updateLegacySessionModel(m);
      validateModel(m);
    });
    return data;
  }

  /**
   * Send a PATCH to the server, updating the session path or the kernel.
   */
  async updateSession(
    model: Pick<SessionIModel, 'id'> & DeepPartial<Omit<SessionIModel, 'id'>>,
    serverSettings?: Partial<ISettings>,
  ): Promise<SessionIModel> {
    const settings = { ...this.serverConnection.settings, ...serverSettings };
    const url = getSessionUrl(settings.baseUrl, model.id);
    const init = {
      method: 'PATCH',
      body: JSON.stringify(model),
    };
    const response = await this.serverConnection.makeRequest(url, init, settings);
    if (response.status !== 200) {
      const err = await createResponseError(response);
      throw err;
    }
    const data = await response.json();
    updateLegacySessionModel(data);
    validateModel(data);
    return data;
  }
}
