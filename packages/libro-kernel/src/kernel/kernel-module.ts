import { ManaModule } from '@difizen/mana-app';

import { LibroServerModule } from '../server/index.js';

import { KernelConnection } from './kernel-connection.js';
import { LibroKernelManager } from './libro-kernel-manager.js';
import type { KernelMeta } from './libro-kernel-protocol.js';
import {
  KernelConnectionOptions,
  LibroKernelConnectionFactory,
  LibroKernelFactory,
  KernelMetaOption,
} from './libro-kernel-protocol.js';
import { LibroKernel } from './libro-kernel.js';
import { KernelRestAPI } from './restapi.js';

export const LibroKernelModule = ManaModule.create()
  .register(
    KernelRestAPI,
    KernelConnection,
    LibroKernelManager,
    LibroKernel,
    {
      token: LibroKernelFactory,
      useFactory: (ctx) => {
        return (kernelMeta: KernelMeta) => {
          const child = ctx.container.createChild();
          child.register({
            token: KernelMetaOption,
            useValue: kernelMeta,
          });
          return child.get(LibroKernel);
        };
      },
    },
    {
      token: LibroKernelConnectionFactory,
      useFactory: (ctx) => {
        return (options: KernelConnectionOptions) => {
          const child = ctx.container.createChild();
          child.register({
            token: KernelConnectionOptions,
            useValue: options,
          });
          return child.get(KernelConnection);
        };
      },
    },
  )
  .dependOn(LibroServerModule);
