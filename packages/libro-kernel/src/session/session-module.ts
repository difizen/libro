import { ManaModule } from '@difizen/libro-common/mana-app';

import { LibroSessionManager } from './libro-session-manager.js';
import type { SessionMeta } from './libro-session-protocol.js';
import { LibroSessionFactory, SessionMetaOption } from './libro-session-protocol.js';
import { LibroSession } from './libro-session.js';
import { SessionRestAPI } from './restapi.js';

export const LibroSessionModule = ManaModule.create().register(
  SessionRestAPI,
  LibroSession,
  LibroSessionManager,
  {
    token: LibroSessionFactory,
    useFactory: (ctx) => {
      return (sessionMeta: SessionMeta) => {
        const child = ctx.container.createChild();
        child.register({
          token: SessionMetaOption,
          useValue: sessionMeta,
        });
        return child.get(LibroSession);
      };
    },
  },
);
