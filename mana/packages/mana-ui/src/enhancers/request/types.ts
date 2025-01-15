import type { Fetch } from './fetch-core';

// Service
export const Service = Symbol('mana-request-service');
export type Service<TData, TParams> = (args: TParams) => Promise<TData>;

// Options
export type TRequestRefreshDep = [Record<string, any>, string | string[]];
export const Options = Symbol('mana-request-options');
export interface Options<TData, TParams> {
  manual?: boolean;

  onBefore?: (params: TParams) => void;
  onSuccess?: (data: TData, params: TParams) => void;
  onError?: (e: Error, params: TParams) => void;
  // formatResult?: (res: any) => TData;
  onFinally?: (params: TParams, data?: TData, e?: Error) => void;

  defaultParams?: TParams;

  // refreshDeps
  refreshDeps?: TRequestRefreshDep[];
  refreshDepsAction?: () => void;

  // loading delay
  loadingDelay?: number;

  // polling
  pollingInterval?: number;
  pollingWhenHidden?: boolean;
  pollingErrorRetryCount?: number;

  // refresh on window focus
  refreshOnWindowFocus?: boolean;
  focusTimespan?: number;

  // debounce
  debounceWait?: number;
  debounceLeading?: boolean;
  debounceTrailing?: boolean;
  debounceMaxWait?: number;

  // throttle
  throttleWait?: number;
  throttleLeading?: boolean;
  throttleTrailing?: boolean;

  // cache
  cacheKey?: string;
  cacheTime?: number;
  staleTime?: number;
  setCache?: (data: CachedData<TData, TParams>) => void;
  getCache?: (params: TParams) => CachedData<TData, TParams> | undefined;

  // retry
  retryCount?: number;
  retryInterval?: number;

  // ready
  ready?: [Record<string, any>, string];
}

export const Plugins = Symbol('mana-request-plugin');
export type Plugins<TData, TParams> = {
  (
    fetchInstance: Fetch<TData, TParams>,
    options: Options<TData, TParams>,
  ): PluginReturn<TData, TParams>;
  onInit?: (options: Options<TData, TParams>) => Partial<FetchState<TData, TParams>>;
};

export interface PluginReturn<TData, TParams> {
  onBefore?: (params: TParams) =>
    | ({
        stopNow?: boolean;
        returnNow?: boolean;
      } & Partial<FetchState<TData, TParams>>)
    | void;

  onRequest?: (
    service: Service<TData, TParams>,
    params: TParams,
  ) => {
    servicePromise?: Promise<TData>;
  };

  onSuccess?: (data: TData, params: TParams) => void;
  onError?: (e: Error, params: TParams) => void;
  onFinally?: (params: TParams, data?: TData, e?: Error) => void;

  onCancel?: () => void;
  onMutate?: (data: TData) => void;
}

export const FetchState = Symbol('FetchState');
export interface FetchState<TData, TParams> {
  loading: boolean;
  params?: TParams;
  data?: TData;
  error?: Error;
}

// TODO: 缓存plugin
export interface CachedData<TData = any, TParams = any> {
  data: TData;
  params: TParams;
  time: number;
}

export interface Result<TData, TParams> {
  loading: boolean;
  data?: TData;
  error?: Error;
  params: TParams;
  cancel: Fetch<TData, TParams>['cancel'];
  refresh: Fetch<TData, TParams>['refresh'];
  refreshAsync: Fetch<TData, TParams>['refreshAsync'];
  run: Fetch<TData, TParams>['run'];
  runAsync: Fetch<TData, TParams>['runAsync'];
  mutate: Fetch<TData, TParams>['mutate'];
}
