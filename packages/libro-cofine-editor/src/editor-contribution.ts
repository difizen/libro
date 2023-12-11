import type { CodeEditorFactory } from '@difizen/libro-code-editor';
import { CodeEditorContribution } from '@difizen/libro-code-editor';
import { inject, singleton } from '@difizen/mana-app';

import { LibroE2EditorFactory } from './libro-e2-editor.js';

@singleton({ contrib: [CodeEditorContribution] })
export class LibroE2EditorContribution implements CodeEditorContribution {
  factory: CodeEditorFactory;

  constructor(
    @inject(LibroE2EditorFactory) libroE2EditorFactory: LibroE2EditorFactory,
  ) {
    this.factory = libroE2EditorFactory;
  }

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
