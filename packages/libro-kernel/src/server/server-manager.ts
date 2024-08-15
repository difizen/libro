import { prop } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';
import { timeout, Deferred } from '@difizen/mana-app';

import type { ISpecModels } from '../kernelspec/restapi.js';
import { KernelSpecRestAPI } from '../kernelspec/restapi.js';

@singleton()
export class ServerManager {
  /**
   * 加载中
   */
  @prop()
  launching?: boolean = true;

  /**
   * 加载成功
   */
  @prop()
  loaded?: boolean = false;

  @prop()
  kernelspec?: ISpecModels;

  protected defer: Deferred<ISpecModels>;

  get ready() {
    return this.defer.promise;
  }

  protected kernelSpecRestAPI: KernelSpecRestAPI;

  constructor(@inject(KernelSpecRestAPI) kernelSpecRestAPI: KernelSpecRestAPI) {
    this.kernelSpecRestAPI = kernelSpecRestAPI;
  }

  async launch() {
    const oldDefer = this.defer;
    this.defer = new Deferred<ISpecModels>();
    this.doLaunch()
      .then((r) => {
        if (oldDefer) {
          oldDefer.resolve(r);
        }
        this.defer.resolve(r);
        return;
      })
      .catch(() => {
        //
      });

    return this.defer.promise;
  }

  protected async doLaunch(): Promise<ISpecModels> {
    const kernelspec = await this.doGetServerStatus();
    this.launching = true;
    this.loaded = false;
    if (!kernelspec) {
      await timeout(1000);
      return await this.doLaunch();
    }
    this.launching = false;
    this.loaded = true;
    this.kernelspec = kernelspec;
    return kernelspec;
  }

  protected async doGetServerStatus(): Promise<ISpecModels | undefined> {
    try {
      const r = await this.kernelSpecRestAPI.getSpecs();
      if (r && r.kernelspecs && Object.keys(r.kernelspecs).length !== 0) {
        return r;
      }
      return;
    } catch (error) {
      console.error(error);
      return;
    }
  }
}
