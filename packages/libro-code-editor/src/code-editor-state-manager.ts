import type { Contribution } from '@difizen/libro-common/mana-app';
import { Priority } from '@difizen/libro-common/mana-app';
import { contrib } from '@difizen/libro-common/mana-app';
import { singleton } from '@difizen/libro-common/mana-app';

import type { IModel } from './code-editor-model.js';
import type { EditorState, IEditorStateOptions } from './code-editor-protocol.js';
import { CodeEditorContribution } from './code-editor-protocol.js';

@singleton()
export class CodeEditorStateManager {
  protected readonly codeEditorProvider: Contribution.Provider<CodeEditorContribution>;
  protected stateCache: Map<string, EditorState> = new Map();

  constructor(
    @contrib(CodeEditorContribution)
    codeEditorProvider: Contribution.Provider<CodeEditorContribution>,
  ) {
    this.codeEditorProvider = codeEditorProvider;
  }

  protected findCodeEditorProvider(model: IModel) {
    const prioritized = Priority.sortSync(
      this.codeEditorProvider.getContributions(),
      (contribution) => contribution.canHandle(model.mimeType),
    );
    const sorted = prioritized.map((c) => c.value);
    return sorted[0];
  }

  async getOrCreateEditorState(option: IEditorStateOptions): Promise<EditorState> {
    if (this.stateCache.has(option.uuid)) {
      const state = this.stateCache.get(option.uuid)!;
      return state;
    }
    const factory = this.findCodeEditorProvider(option.model)?.stateFactory;
    if (!factory) {
      throw new Error(
        `no code editor state factory registered for mimetype: ${option.model.mimeType}`,
      );
    }
    const state = factory(option);
    this.stateCache.set(option.uuid, state);
    return state;
  }

  updateEditorState(id: string, state: EditorState) {
    this.stateCache.set(id, state);
  }

  removeEditorState(id: string) {
    this.stateCache.delete(id);
  }
}
