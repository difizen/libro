import { DisposableCollection } from '@difizen/mana-common';
import { prop, watch } from '@difizen/mana-observable';
import { inject, transient } from '@difizen/mana-syringe';
import type { FormInstance, TableProps } from 'antd';

import type { Data, Pagination, TableParams, TableResult } from './types';
import { TableOptions, TableService } from './types';

@transient()
export class AntdTableService<TData, TParams extends Record<string, any>> {
  @prop()
  pagination: Pagination = {
    current: 1,
    pageSize: 10,
    total: 0,
  };

  @prop()
  data: Data<TData> = {
    list: [],
    total: 0,
  };

  @prop()
  loading = false;

  @prop()
  error?: Error;

  @prop()
  params: TableParams<TParams> = undefined!;

  protected defaultParams: TableParams<TParams> = undefined!;

  protected options?: TableOptions<TData, TableParams<TParams>>;

  protected form: FormInstance<Record<string, any>> = undefined!;

  protected service: TableService<TData, TableParams<TParams>>;

  protected toDispose = new DisposableCollection();

  constructor(
    @inject(TableOptions)
    options: TableOptions<TData, TableParams<TParams>>,
    @inject(TableService)
    service: TableService<TData, TableParams<TParams>>,
  ) {
    this.options = options;
    this.service = service;
    this.pagination = {
      current: options?.defaultCurrent || 1,
      pageSize: options?.defaultPageSize || 10,
      total: 0,
    };

    if (this.options.defaultParams) {
      this.defaultParams = this.options.defaultParams;
    }

    if (this.options.refreshDeps) {
      this.options.refreshDeps.forEach((dep) => {
        const [target, keys] = dep;
        const watchKeys = ([] as string[]).concat(keys);
        this.toDispose.pushAll(
          watchKeys.map((key) => {
            return watch(target, key, () => {
              this.refresh();
            });
          }),
        );
      });
    }

    if (!this.options.manual) {
      this.initialLoad();
    }
  }

  run = (params: TableParams<TParams>) => {
    this.params = params;
    const { onBefore, onSuccess, onError } = this.options || {};
    if (onBefore) {
      onBefore(params);
    }
    this.loading = true;
    this.error = undefined;
    this.service(params)
      .then((data) => {
        if (!this.loading) {
          return;
        }
        this.data = data;
        this.pagination = {
          current: params[0].current ?? this.pagination.current,
          pageSize: params[0].pageSize ?? this.pagination.pageSize,
          total: data.total,
        };
        onSuccess?.(data, params);
        return;
      })
      .finally(() => {
        this.loading = false;
      })
      .catch((e) => {
        this.error = e;
        onError?.(e, params);
      });
  };

  runAsync = (params: TableParams<TParams>) => {
    this.params = params;
    const { onBefore, onSuccess, onError } = this.options || {};
    if (onBefore) {
      onBefore(params);
    }
    this.loading = true;
    this.error = undefined;
    return this.service(params)
      .then((data) => {
        if (!this.loading) {
          return;
        }
        this.data = data;
        this.pagination = {
          current: params[0].current ?? this.pagination.current,
          pageSize: params[0].pageSize ?? this.pagination.pageSize,
          total: data.total,
        };
        onSuccess?.(data, params);
        return data;
      })
      .catch((e) => {
        this.error = e;
        onError?.(e, params);
      })
      .finally(() => {
        this.loading = false;
      });
  };

  refresh = () => {
    const formValues = this.form?.getFieldsValue();
    const params = [this.params[0], formValues] as unknown as TableParams<TParams>;
    this.runAsync(params);
  };

  refreshAsync = async () => {
    const formValues = this.form?.getFieldsValue();
    const params = [this.params[0], formValues] as unknown as TableParams<TParams>;
    return this.runAsync(params);
  };

  mutate = (data?: Data<TData> | { (oldData: Data<TData>): Data<TData> }) => {
    if (typeof data === 'function') {
      this.data = (data as any)(this.data);
    } else {
      this.data = data!;
    }
  };

  cancel = () => {
    this.loading = false;
  };

  onChange: Required<TableProps<TData>>['onChange'] = (
    pagination,
    filters,
    sorters,
  ) => {
    const params = [
      {
        current: pagination.current || this.pagination.current,
        pageSize: pagination.pageSize || this.pagination.pageSize,
        filter: filters,
        sorter: sorters,
      },
      this.params[1],
    ] as unknown as TableParams<TParams>;
    this.run(params);
  };

  submit = () => {
    this.pagination.current = 1;
    this.form?.validateFields().then((values) => {
      const params = [
        {
          ...this.params[0],
          current: this.pagination.current,
          pageSize: this.pagination.pageSize,
        },
        values,
      ] as unknown as TableParams<TParams>;
      this.run(params);
      return;
    });
  };

  reset = () => {
    this.form?.resetFields();
    this.pagination.current = 1;
    const params = [
      {
        ...this.params[0],
        current: this.pagination.current,
        pageSize: this.pagination.pageSize,
      },
      {},
    ] as unknown as TableParams<TParams>;
    this.run(params);
  };

  // 在传入form 时，同时设置初始化的 formValue
  setForm = (form: FormInstance<Record<string, any>>) => {
    if (!this.form) {
      this.form = form;
      if (this.defaultParams && this.defaultParams[1]) {
        form.setFieldsValue(this.defaultParams[1]);
      }
    } else {
      console.error('[ManaEnhancer] form has been set, can not set again');
    }
  };

  protected initialLoad = () => {
    const defaultParams = this.defaultParams;
    const requestParams: TableParams<TParams> = [] as any;
    if (!defaultParams) {
      this.run([
        {
          current: this.pagination.current,
          pageSize: this.pagination.pageSize,
        },
      ] as TableParams<TParams>);
      return;
    }

    if (defaultParams[0]) {
      requestParams[0] = {
        current: defaultParams[0].current || this.pagination.current,
        pageSize: defaultParams[0].pageSize || this.pagination.pageSize,
      };
    }
    if (defaultParams[1]) {
      requestParams[1] = defaultParams[1];
    }
    this.run(requestParams);
  };

  get tableProps(): TableResult<TData, TableParams<TParams>>['tableProps'] {
    return {
      dataSource: this.data.list,
      loading: this.loading,
      onChange: this.onChange,
      pagination: this.pagination,
    };
  }

  get search(): TableResult<TData, TableParams<TParams>>['search'] {
    return {
      submit: this.submit,
      reset: this.reset,
    };
  }

  // TODO: 销毁 watcher
  dispose = () => {
    this.toDispose.dispose();
  };
}
