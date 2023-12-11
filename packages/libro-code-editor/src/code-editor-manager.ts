import type { Contribution } from '@difizen/mana-app';
import {
  Priority,
  ViewManager,
  contrib,
  inject,
  singleton,
  Syringe,
} from '@difizen/mana-app';

import { CodeEditorInfoManager } from './code-editor-info-manager.js';
import type { IModel } from './code-editor-model.js';
import type { IEditor, IEditorOptions } from './code-editor-protocol.js';
import type { CodeEditorViewOptions } from './code-editor-view.js';
import { CodeEditorView } from './code-editor-view.js';

/**
 * A factory used to create a code editor.
 */
export type CodeEditorFactory = (options: IEditorOptions) => IEditor;

export const CodeEditorContribution = Syringe.defineToken('CodeEditorContribution');
export interface CodeEditorContribution {
  canHandle(mime: string): number;
  factory: CodeEditorFactory;
}

@singleton()
export class CodeEditorManager {
  protected readonly codeEditorProvider: Contribution.Provider<CodeEditorContribution>;
  protected readonly viewManager: ViewManager;
  protected codeEditorInfoManager: CodeEditorInfoManager;

  constructor(
    @contrib(CodeEditorContribution)
    codeEditorProvider: Contribution.Provider<CodeEditorContribution>,
    @inject(ViewManager) viewManager: ViewManager,
    @inject(CodeEditorInfoManager) codeEditorInfoManager: CodeEditorInfoManager,
  ) {
    this.codeEditorProvider = codeEditorProvider;
    this.viewManager = viewManager;
    this.codeEditorInfoManager = codeEditorInfoManager;
  }

  setEditorHostRef(id: string, ref: any) {
    this.codeEditorInfoManager.setEditorHostRef(id, ref);
  }

  protected findCodeEditorProvider(model: IModel) {
    const prioritized = Priority.sortSync(
      this.codeEditorProvider.getContributions(),
      (contribution) => contribution.canHandle(model.mimeType),
    );
    const sorted = prioritized.map((c) => c.value);
    return sorted[0];
  }

  async getOrCreateEditorView(option: CodeEditorViewOptions): Promise<CodeEditorView> {
    const factory = this.findCodeEditorProvider(option.model)?.factory;
    if (!factory) {
      throw new Error(`no code editor found for mimetype: ${option.model.mimeType}`);
    }
    const editorView = await this.viewManager.getOrCreateView<
      CodeEditorView,
      CodeEditorViewOptions
    >(CodeEditorView, {
      factory,
      ...option,
    });
    return editorView;
  }
}
