import { prop } from '@difizen/libro-common/app';
import { transient, inject } from '@difizen/libro-common/app';

import type { KernelConnection } from '../kernel/kernel-connection.js';
import type { SessionId } from '../session/libro-session-protocol.js';

import { KernelMetaOption } from './libro-kernel-protocol.js';
import type { KernelId, KernelStatus, KernelMeta } from './libro-kernel-protocol.js';

@transient()
export class LibroKernel {
  id: KernelId;
  name: string;

  @prop()
  last_activity: string;

  @prop()
  execution_state: KernelStatus;

  @prop()
  connections: number;

  @prop()
  sessionIds: Set<SessionId>;

  @prop()
  kernelConnection?: KernelConnection;

  constructor(@inject(KernelMetaOption) meta: KernelMeta) {
    this.id = meta.id;
    this.name = meta.name;
    this.last_activity = meta.last_activity;
    this.execution_state = meta.execution_state;
    this.connections = meta.connections;
    this.sessionIds = new Set();
    this.kernelConnection = undefined;
  }
}
