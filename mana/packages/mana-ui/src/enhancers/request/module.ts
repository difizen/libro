import { ManaModule } from '@difizen/mana-core';

import { Fetch } from './fetch-core';
import { AutoRunPlugin } from './plugin/autoRunPlugin';
import { RequestService } from './request';
import { Options, Service } from './types';

export const RequestFactory = Symbol('mana-request-service-factory');
export type RequestFactory = {
  create: <TData, TParams>(
    service: Service<TData, TParams>,
    options?: Options<TData, TParams>,
  ) => RequestService<TData, TParams>;
};

export { RequestService } from './request';

export const RequestModule = ManaModule.create().register(
  Fetch,
  RequestService,
  AutoRunPlugin,
  {
    token: RequestFactory,
    useDynamic: (ctx) => {
      return {
        create: <TData = any, TParams = any>(
          service: Service<TData, TParams>,
          options: Options<TData, TParams> = {},
        ) => {
          const container = ctx.container.createChild();
          container.register({ token: Service, useValue: service });
          container.register({ token: Options, useValue: options });
          return container.get(RequestService);
        },
      };
    },
  },
);
