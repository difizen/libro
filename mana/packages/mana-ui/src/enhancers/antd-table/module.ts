import { ManaModule } from '@difizen/mana-app';

import type { TableParams } from './types';
import { TableOptions, TableService } from './types';

import { AntdTableService } from './index';

export const AntdTableServiceFactory = Symbol('antd-table-service-factory');
export type AntdTableServiceFactory = {
  create: <TData = any, TParams extends Record<string, any> = any>(
    service: TableService<TData, TableParams<TParams>>,
    options?: TableOptions<TData, TableParams<TParams>>,
  ) => AntdTableService<TData, TParams>;
};

export { AntdTableService } from './index';

export const AntdTableModule = ManaModule.create().register(AntdTableService, {
  token: AntdTableServiceFactory,
  useDynamic: (ctx) => {
    return {
      create: <
        TData = any,
        TParams extends Record<string, any> | undefined = undefined,
      >(
        service: TableService<TData, TableParams<TParams>>,
        options: TableOptions<TData, TableParams<TParams>> = {},
      ) => {
        const container = ctx.container.createChild();
        container.register({
          token: TableService,
          useValue: service,
        });
        container.register({
          token: TableOptions,
          useValue: options,
        });
        return container.get(AntdTableService);
      },
    };
  },
});
