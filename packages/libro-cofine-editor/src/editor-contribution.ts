import type { CodeEditorFactory, EditorStateFactory } from '@difizen/libro-code-editor';
import {
  CodeEditorContribution,
  LanguageSpecRegistry,
} from '@difizen/libro-code-editor';
import { inject, singleton } from '@difizen/libro-common/mana-app';

import {
  e2StateFactory,
  libroE2DefaultConfig,
  LibroE2EditorFactory,
} from './libro-e2-editor.js';

@singleton({ contrib: [CodeEditorContribution] })
export class LibroE2EditorContribution implements CodeEditorContribution {
  @inject(LanguageSpecRegistry)
  protected readonly languageSpecRegistry: LanguageSpecRegistry;

  factory: CodeEditorFactory;

  defaultConfig = libroE2DefaultConfig;

  constructor(
    @inject(LibroE2EditorFactory) libroE2EditorFactory: LibroE2EditorFactory,
  ) {
    this.factory = libroE2EditorFactory;
  }

  stateFactory: EditorStateFactory<any> = (options) => {
    return e2StateFactory(this.languageSpecRegistry)({
      uuid: options.uuid,
      model: options.model,
    });
  };

  canHandle(): number {
    return 50;
  }
}
