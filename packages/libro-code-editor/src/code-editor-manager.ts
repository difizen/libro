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
import type { IEditor, IEditorConfig, IEditorOptions } from './code-editor-protocol.js';
import { CodeEditorSettings } from './code-editor-settings.js';
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
  defaultConfig: IEditorConfig;
}

@singleton()
export class CodeEditorManager {
  @contrib(CodeEditorContribution)
  protected readonly codeEditorProvider: Contribution.Provider<CodeEditorContribution>;
  @inject(ViewManager) protected readonly viewManager: ViewManager;
  @inject(CodeEditorInfoManager) protected codeEditorInfoManager: CodeEditorInfoManager;
  @inject(CodeEditorSettings) protected readonly codeEditorSettings: CodeEditorSettings;

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

  /**
   * 获取默认配置
   * @param model
   * @returns
   */
  getEditorDefaultConfig(model: IModel) {
    return this.findCodeEditorProvider(model)?.defaultConfig;
  }

  /**
   * 用户配置+默认配置（还有一部分配置在cell中指定）
   * @param model
   * @returns
   */
  getUserEditorConfig(model: IModel) {
    return {
      ...this.getEditorDefaultConfig(model),
      ...this.codeEditorSettings.getUserEditorSettings(),
    };
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
