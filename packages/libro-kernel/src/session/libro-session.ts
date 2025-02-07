import { transient, inject } from '@difizen/libro-common/mana-app';

import type { LibroKernel } from '../kernel/libro-kernel.js';

import type {
  NotebookInSession,
  SessionId,
  SessionMeta,
} from './libro-session-protocol.js';
import { SessionMetaOption } from './libro-session-protocol.js';

@transient()
export class LibroSession {
  id: SessionId;
  name: string;

  type: string;

  path: string;

  kernel: LibroKernel;

  notebook: NotebookInSession;

  constructor(@inject(SessionMetaOption) meta: SessionMeta) {
    this.id = meta.id;
    this.name = meta.name;
    this.type = meta.type;
    this.path = meta.path;
    this.kernel = meta.kernel;
    this.notebook = meta.notebook;
  }
}
