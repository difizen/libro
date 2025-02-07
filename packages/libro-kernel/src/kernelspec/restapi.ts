// import { URL } from '@difizen/libro-common';
import type { PartialJSONObject } from '@difizen/libro-common';
import { inject, singleton } from '@difizen/libro-common/app';

import { createResponseError } from '../server/connection-error.js';
import type { ISettings } from '../server/server-connection-protocol.js';
import { ServerConnection } from '../server/server-connection.js';

import { validateSpecModels } from './validate.js';

/**
 * The url for the kernelspec service.
 */
const KERNELSPEC_SERVICE_URL = 'api/kernelspecs';
@singleton()
export class KernelSpecRestAPI {
  @inject(ServerConnection) serverConnection: ServerConnection;
  /**
   * Fetch all of the kernel specs.
   *
   * @param settings - The optional server settings.
   * @param useCache - Whether to use the cache. If false, always request.
   *
   * @returns A promise that resolves with the kernel specs.
   *
   * #### Notes
   * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernelspecs).
   */
  async getSpecs(serverSettings?: Partial<ISettings>): Promise<ISpecModels> {
    const settings = { ...this.serverConnection.settings, ...serverSettings };
    const url = settings.baseUrl + KERNELSPEC_SERVICE_URL;
    // TODO: 当前URL.join 方法是坏的
    // const url = URL.join(settings.baseUrl, KERNELSPEC_SERVICE_URL);

    const response = await this.serverConnection.makeRequest(url, {}, settings);
    if (response.status !== 200) {
      const err = await createResponseError(response);
      throw err;
    }
    const data = await response.json();
    return validateSpecModels(data);
  }
}

/**
 * Kernel Spec interface.
 *
 * #### Notes
 * See [Kernel specs](https://jupyter-client.readthedocs.io/en/latest/kernels.html#kernelspecs).
 */
export interface ISpecModel extends PartialJSONObject {
  /**
   * The name of the kernel spec.
   */
  readonly name: string;

  /**
   * The name of the language of the kernel.
   */
  readonly language: string;

  /**
   * A list of command line arguments used to start the kernel.
   */
  readonly argv: string[];

  /**
   * The kernel’s name as it should be displayed in the UI.
   */
  readonly display_name: string;

  /**
   * A dictionary of environment variables to set for the kernel.
   */
  readonly env?: PartialJSONObject;

  /**
   * A mapping of resource file name to download path.
   */
  readonly resources: Record<string, string>;

  /**
   * A dictionary of additional attributes about this kernel; used by clients to aid in kernel selection.
   */
  readonly metadata?: PartialJSONObject;
}

/**
 * The available kernelSpec models.
 *
 * #### Notes
 * See the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernelspecs).
 */
export interface ISpecModels extends PartialJSONObject {
  /**
   * The name of the default kernel spec.
   */
  default: string;

  /**
   * A mapping of kernel spec name to spec.
   */
  readonly kernelspecs: Record<string, ISpecModel | undefined>;
}
