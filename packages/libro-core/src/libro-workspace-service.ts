import { URI } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';

import type { NotebookView } from './libro-protocol.js';

export const ILibroWorkspaceService = Symbol('ILibroWorkspaceService');
export interface ILibroWorkspaceService {
  get workspaceRoot(): URI;
  get notebooks(): NotebookView[];
  get files(): URI[];
}

@singleton({ contrib: ILibroWorkspaceService })
export class BaseWorkspaceService implements ILibroWorkspaceService {
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
