import { DisposableCollection } from '@difizen/mana-common';
import { prop } from '@difizen/mana-observable';
import { transient } from '@difizen/mana-syringe';

import { isFunction } from '../utils';

import type { PluginReturn } from './types';
import type { FetchState, Options, Service } from './types';

/**
 * 实现了基础请求
 */
@transient()
export class Fetch<TData, TParams> {
  // plugin 注入的能力
  pluginReturn: PluginReturn<TData, TParams>[] = [];

  count = 0;

  @prop()
  state: FetchState<TData, TParams> = {
    loading: false,
    params: undefined,
    data: undefined,
    error: undefined,
  };

  toDispose = new DisposableCollection();

  constructor(
    public service: Service<TData, TParams>,
    public options: Options<TData, TParams>,
    // public subscribe: any,
    public initState: Partial<FetchState<TData, TParams>> = {},
  ) {
    this.state = {
      ...this.state,
      loading: !options.manual,
      ...initState,
    };
  }

  setState(currentState: Partial<FetchState<TData, TParams>> = {}) {
    this.state = {
      ...this.state,
      ...currentState,
    };
  }

  runPluginHandlder(event: keyof PluginReturn<TData, TParams>, ...rest: any[]) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const r = this.pluginReturn.map((item) => item[event]?.(...rest)).filter(Boolean);
    return Object.assign({}, ...r);
  }

  runAsync = async (params: TParams): Promise<TData | undefined> => {
    this.count += 1;
    const currentCount = this.count;

    const { stopNow = false, ...state } = this.runPluginHandlder('onBefore', params);

    if (stopNow) {
      return new Promise(() => {
        //
      });
    }

    this.setState({
      loading: true,
      params,
      ...state,
    });

    this.options.onBefore?.(params);

    try {
      let { servicePromise } = this.runPluginHandlder(
        'onRequest',
        this.service,
        params,
      );
      if (!servicePromise) {
        servicePromise = this.service(params);
      }
      const res = await servicePromise;

      if (currentCount !== this.count) {
        // prevent run.then when request is canceled
        return undefined;
      }

      this.setState({
        data: res,
        loading: false,
        error: undefined,
      });

      this.runPluginHandlder('onSuccess', res, params);
      this.options.onSuccess?.(res, params);

      this.runPluginHandlder('onFinally', params, res, undefined);
      this.options.onFinally?.(params, res, undefined);

      return res;
    } catch (error) {
      if (currentCount !== this.count) {
        // prevent run.then when request is canceled
        return new Promise(() => {
          //
        });
      }

      this.setState({
        error: error as Error,
        loading: false,
      });
      this.options.onError?.(error as Error, params);
      this.runPluginHandlder('onError', error, params);
      throw error;
    }
  };

  run = (params: TParams) => {
    this.runAsync(params).catch((error) => {
      if (!this.options.onError) {
        console.error(error);
      }
    });
  };

  cancel = () => {
    this.count += 1;
    this.setState({
      loading: false,
    });

    this.runPluginHandlder('onCancel');
  };

  refresh = () => {
    this.run((this.state.params || {}) as TParams);
  };

  refreshAsync = () => {
    return this.runAsync((this.state.params || {}) as TParams);
  };

  mutate(data?: TData | ((oldData?: TData) => TData | undefined)) {
    const targetData = isFunction(data) ? data(this.state.data) : data;
    this.runPluginHandlder('onMutate', targetData);
    this.setState({
      data: targetData,
    });
  }
}
