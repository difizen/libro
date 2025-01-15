import { ManaModule } from '@difizen/mana-app';

import { AntdTableModule } from './antd-table/module';
import { RequestModule } from './request/module';

export { AntdTableService, AntdTableServiceFactory } from './antd-table/module';

export { RequestService, RequestFactory } from './request/module';

export type {
  TableQueryParams,
  TableParams,
  Pagination,
  TableResult,
  TableOptions,
  TableService,
  TableRefreshDep,
} from './antd-table/types';
export type { Service, Options, Plugins, FetchState, Result } from './request/types';

export const EnhancerModule = ManaModule.create().dependOn(
  RequestModule,
  AntdTableModule,
);
