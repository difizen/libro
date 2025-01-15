import { watch } from '@difizen/mana-observable';
import { inject } from '@difizen/mana-syringe';

import { Fetch } from '../fetch-core';
import type { PluginReturn } from '../types';
import { Options } from '../types';

// support refreshDeps & ready
export class AutoRunPlugin<TData, TParams> {
  fetchInstance: Fetch<TData, TParams>;
  options: Options<TData, TParams>;

  constructor(
    @inject(Fetch) fetchInstance: Fetch<TData, TParams>,
    @inject(Options) options: Options<TData, TParams>,
  ) {
    this.fetchInstance = fetchInstance;
    this.options = options;

    const {
      manual,
      ready = [{ defaultReady: true }, 'defaultReady'],
      defaultParams = {},
      refreshDeps = [],
      refreshDepsAction,
    } = this.options;

    this.fetchInstance.toDispose.push(
      watch(ready[0], ready[1], () => {
        // 自动更新状态下，ready为true则发起请求
        if (!manual && ready[0][ready[1]]) {
          fetchInstance.run(defaultParams as TParams);
        }
      }),
    );

    if (refreshDeps) {
      if (!manual) {
        if (refreshDepsAction) {
          refreshDepsAction();
        } else {
          refreshDeps.forEach((dep) => {
            const [target, keys] = dep;
            const watchKeys = ([] as string[]).concat(keys);
            this.fetchInstance.toDispose.pushAll(
              watchKeys.map((key) => {
                return watch(target, key, () => {
                  this.fetchInstance.refresh();
                });
              }),
            );
          });
        }
      }
    }
  }

  onBefore = () => {
    const ready = this.options.ready;
    if (ready === undefined) {
      return;
    }
    if (!ready[0][ready[1]]) {
      return {
        stopNow: true,
      };
    }
    return;
  };

  pluginReturn = (): PluginReturn<TData, TParams> => {
    return {
      onBefore: this.onBefore,
    };
  };
}
