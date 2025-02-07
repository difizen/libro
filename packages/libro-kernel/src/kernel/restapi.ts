import { URL } from '@difizen/libro-common';
import { inject, singleton } from '@difizen/libro-common/mana-app';

import type { ISettings } from '../server/index.js';
import { createResponseError, ServerConnection } from '../server/index.js';

import type { IKernelModel, KernelMeta } from './libro-kernel-protocol.js';
import { validateModel, validateModels } from './validate.js';

export const KERNEL_SERVICE_URL = 'api/kernels';

@singleton()
export class KernelRestAPI {
  @inject(ServerConnection) serverConnection: ServerConnection;

  /**
   * Get a full kernel model from the server by kernel id string.
   *
   * #### Notes
   * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels) and validates the response model.
   *
   * The promise is fulfilled on a valid response and rejected otherwise.
   */
  async getKernelModel(
    id: string,
    serverSettings?: Partial<ISettings>,
  ): Promise<IKernelModel | undefined> {
    const settings = { ...this.serverConnection.settings, ...serverSettings };
    const url = URL.join(settings.baseUrl, KERNEL_SERVICE_URL, encodeURIComponent(id));

    const response = await this.serverConnection.makeRequest(url, {}, settings);
    if (response.status === 404) {
      return undefined;
    } else if (response.status !== 200) {
      const err = await createResponseError(response);
      throw err;
    }
    const data = await response.json();
    validateModel(data);
    return data;
  }

  /**
   * Start a new kernel.
   *
   * @param options - The options used to create the kernel.
   *
   * @returns A promise that resolves with a kernel connection object.
   *
   * #### Notes
   * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels) and validates the response model.
   *
   * The promise is fulfilled on a valid response and rejected otherwise.
   */
  async startNew(
    options: IKernelOptions = {},
    serverSettings?: Partial<ISettings>,
  ): Promise<IKernelModel> {
    const settings = { ...this.serverConnection.settings, ...serverSettings };
    const url = URL.join(settings.baseUrl, KERNEL_SERVICE_URL);
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
    validateModel(data);
    return data;
  }

  /**
   * Fetch the running kernels.
   *
   * @param settings - The optional server settings.
   *
   * @returns A promise that resolves with the list of running kernels.
   *
   * #### Notes
   * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels) and validates the response model.
   *
   * The promise is fulfilled on a valid response and rejected otherwise.
   */
  async listRunning(serverSettings?: Partial<ISettings>): Promise<KernelMeta[]> {
    const settings = { ...this.serverConnection.settings, ...serverSettings };
    const url = URL.join(settings.baseUrl, KERNEL_SERVICE_URL);
    const response = await this.serverConnection.makeRequest(url, {}, settings);
    if (response.status !== 200) {
      const err = await createResponseError(response);
      throw err;
    }
    const data = await response.json();
    validateModels(data);
    return data;
  }

  /**
   * Shut down a kernel.
   *
   * @param id - The id of the running kernel.
   *
   * @param settings - The server settings for the request.
   *
   * @returns A promise that resolves when the kernel is shut down.
   *
   *
   * #### Notes
   * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels) and validates the response model.
   *
   * The promise is fulfilled on a valid response and rejected otherwise.
   */
  async shutdownKernel(id: string, serverSettings?: Partial<ISettings>): Promise<void> {
    const settings = { ...this.serverConnection.settings, ...serverSettings };
    const url = URL.join(settings.baseUrl, KERNEL_SERVICE_URL, encodeURIComponent(id));
    const init = { method: 'DELETE' };
    const response = await this.serverConnection.makeRequest(url, init, settings);
    if (response.status === 404) {
      const msg = `The kernel "${id}" does not exist on the server`;
      console.warn(msg);
    } else if (response.status !== 204) {
      const err = await createResponseError(response);
      throw err;
    }
  }

  /**
   * Restart a kernel.
   *
   * #### Notes
   * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels) and validates the response model.
   *
   * The promise is fulfilled on a valid response (and thus after a restart) and rejected otherwise.
   */
  async restartKernel(id: string, serverSettings?: Partial<ISettings>): Promise<void> {
    const settings = { ...this.serverConnection.settings, ...serverSettings };
    const url = URL.join(
      settings.baseUrl,
      KERNEL_SERVICE_URL,
      encodeURIComponent(id),
      'restart',
    );
    const init = { method: 'POST' };

    const response = await this.serverConnection.makeRequest(url, init, settings);
    if (response.status !== 200) {
      const err = await createResponseError(response);
      throw err;
    }
    const data = await response.json();
    validateModel(data);
  }

  /**
   * Interrupt a kernel.
   *
   * #### Notes
   * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels) and validates the response model.
   *
   * The promise is fulfilled on a valid response and rejected otherwise.
   */
  async interruptKernel(
    id: string,
    serverSettings?: Partial<ISettings>,
  ): Promise<void> {
    const settings = { ...this.serverConnection.settings, ...serverSettings };
    const url = URL.join(
      settings.baseUrl,
      KERNEL_SERVICE_URL,
      encodeURIComponent(id),
      'interrupt',
    );
    const init = { method: 'POST' };
    const response = await this.serverConnection.makeRequest(url, init, settings);
    if (response.status !== 204) {
      const err = await createResponseError(response);
      throw err;
    }
  }
}
export type IKernelOptions = Partial<Pick<IKernelModel, 'name'>>;
