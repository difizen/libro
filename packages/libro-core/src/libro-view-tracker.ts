import { singleton } from '@difizen/mana-app';

import type { NotebookModel, NotebookView } from './libro-protocol.js';

@singleton()
export class LibroViewTracker {
  viewCache: Map<string, NotebookView> = new Map();
  modelCache: Map<string, NotebookModel> = new Map();
}
