import { inject, transient } from '@difizen/mana-app';

import { Fetch } from './fetch-core';
import { AutoRunPlugin } from './plugin/autoRunPlugin';
import type { Plugins } from './types';
import { Options, Service } from './types';

@transient()
export class RequestService<TData, TParams> {
  protected service?: Service<TData, TParams>;
  protected options?: Options<TData, TParams>;
  protected plugins?: Plugins<TData, TParams>[] = [];

  protected fetchInstance: Fetch<TData, TParams>;

  constructor(
    @inject(Service) service: Service<TData, TParams>,
    @inject(Options) options: Options<TData, TParams>,
  ) {
    this.service = service;
    this.options = options;
    // option 中 manual 赋默认值 false
    const { manual = false, ...rest } = options;
    const fetchOptions = {
      manual,
      ...rest,
    };

    const ready = fetchOptions?.ready;

    this.fetchInstance = new Fetch<TData, TParams>(service, fetchOptions, {
      loading: !fetchOptions.manual && (ready ? ready[0][ready[1]] : true),
    });

    this.plugins = [AutoRunPlugin].map(
      (item: any) => new item(this.fetchInstance, fetchOptions),
    );

    this.fetchInstance.pluginReturn = this.plugins.map((item: any) =>
      item.pluginReturn(),
    );

    if (!manual) {
      const params =
        this.fetchInstance.state.params || fetchOptions.defaultParams || {};
      this.fetchInstance.run(params as TParams);
    }
  }

  get loading() {
    return this.fetchInstance.state.loading;
  }

  get data() {
    return this.fetchInstance.state.data;
  }

  get error() {
    return this.fetchInstance.state.error;
  }

  get params() {
    return this.fetchInstance.state.params;
  }

  get refresh() {
    return this.fetchInstance.refresh;
  }

  get refreshAsync() {
    return this.fetchInstance.refreshAsync;
  }

  get run() {
    return this.fetchInstance.run;
  }

  get runAsync() {
    return this.fetchInstance.runAsync;
  }

  get mutate() {
    return this.fetchInstance.mutate;
  }

  // TODO: 销毁 watcher
  dispose = () => {
    this.fetchInstance.toDispose.dispose();
  };
}
