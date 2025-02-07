import { Deferred, URI } from '@difizen/libro-common/mana-app';
import { singleton } from '@difizen/libro-common/mana-app';

import type { NotebookView } from './libro-protocol.js';

export const ILibroWorkspaceService = Symbol('ILibroWorkspaceService');
export interface ILibroWorkspaceService {
  ready: Promise<void>;
  get workspaceRoot(): URI;
  get notebooks(): NotebookView[];
  get files(): URI[];
}

@singleton({ contrib: ILibroWorkspaceService })
export class BaseWorkspaceService implements ILibroWorkspaceService {
  protected deferred = new Deferred<void>();
  ready = this.deferred.promise;

  get workspaceRoot() {
    return new URI('/');
  }
  get notebooks() {
    return [];
  }
  get files() {
    return [];
  }
}
