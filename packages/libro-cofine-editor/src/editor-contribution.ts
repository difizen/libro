import type { CodeEditorFactory, EditorStateFactory } from '@difizen/libro-code-editor';
import { CodeEditorContribution } from '@difizen/libro-code-editor';
import { inject, singleton } from '@difizen/mana-app';

import { LanguageSpecRegistry } from './language-specs.js';
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

  canHandle(mime: string): number {
    const mimes = [
      'application/vnd.libro.sql+json',
      'text/x-python',
      'application/vnd.libro.prompt+json',
    ];
    if (mimes.includes(mime)) {
      return 50 + 1;
    }
    return 0;
  }
}
