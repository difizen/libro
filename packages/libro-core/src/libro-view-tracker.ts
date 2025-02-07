import { singleton } from '@difizen/libro-common/app';

import type { NotebookModel, NotebookView } from './libro-protocol.js';

@singleton()
export class LibroViewTracker {
  viewCache: Map<string, NotebookView> = new Map();
  modelCache: Map<string, NotebookModel> = new Map();
}
