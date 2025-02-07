import { prop } from '@difizen/libro-common/mana-app';
import { inject, singleton } from '@difizen/libro-common/mana-app';
import { timeout, Deferred } from '@difizen/libro-common/mana-app';

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

  protected defer: Deferred<ISpecModels> = new Deferred<ISpecModels>();

  get ready() {
    return this.defer.promise;
  }

  protected kernelSpecRestAPI: KernelSpecRestAPI;

  constructor(@inject(KernelSpecRestAPI) kernelSpecRestAPI: KernelSpecRestAPI) {
    this.kernelSpecRestAPI = kernelSpecRestAPI;
  }

  loading = false;

  async launch() {
    let current = this.defer;

    // 启动中
    if (this.loading) {
      return current.promise;
    }

    // 启动过
    if (this.loaded) {
      this.loaded = false;
      current = new Deferred<ISpecModels>();
      this.defer = current;
    }

    // 首次启动
    this.loading = true;
    this.doLaunch()
      .then((r) => {
        this.loading = false;
        this.loaded = true;
        return current.resolve(r);
      })
      .catch(console.error);
    return current.promise;
  }

  protected async doLaunch(): Promise<ISpecModels> {
    const kernelspec = await this.doGetServerStatus();
    this.launching = true;
    if (!kernelspec) {
      await timeout(1000);
      return await this.doLaunch();
    }
    this.launching = false;
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
