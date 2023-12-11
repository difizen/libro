import { EditorHandlerContribution } from '@difizen/libro-cofine-editor-contribution';
import type { Contribution } from '@difizen/mana-app';
import { contrib, singleton } from '@difizen/mana-app';
import * as monaco from '@difizen/monaco-editor-core';

@singleton()
export class EditorHanlerRegistry {
  contributions: EditorHandlerContribution[];
  effected: EditorHandlerContribution[] = [];
  provider: Contribution.Provider<EditorHandlerContribution>;
  constructor(
    @contrib(EditorHandlerContribution)
    provider: Contribution.Provider<EditorHandlerContribution>,
  ) {
    this.provider = provider;
    this.contributions = provider.getContributions();
  }

  handleAfter(
    languege: string,
    editor: monaco.editor.IStandaloneCodeEditor | monaco.editor.IStandaloneDiffEditor,
  ): void {
    this.effected.forEach((contribution) => contribution.dispose());
    this.effected = [];
    this.contributions = this.provider.getContributions({ cache: false });
    const canHanleList = this.contributions.filter((handler) =>
      handler.canHandle(languege),
    );
    canHanleList.forEach((contribution) => {
      contribution.afterCreate(editor, monaco);
      this.effected.push(contribution);
    });
  }

  handleBefore(languege: string): void {
    this.contributions = this.provider.getContributions({ cache: false });
    this.effected.forEach((contribution) => contribution.dispose());
    this.effected = [];
    const canHanleList = this.contributions.filter((handler) =>
      handler.canHandle(languege),
    );
    canHanleList.forEach((contribution) => {
      contribution.beforeCreate(monaco);
      this.effected.push(contribution);
    });
  }
}
