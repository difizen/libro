import type { CodeEditorFactory } from '@difizen/libro-code-editor';
import { CodeEditorContribution } from '@difizen/libro-code-editor';
import { singleton } from '@difizen/mana-app';

import { codeMirrorEditorFactory } from './factory.js';

@singleton({ contrib: [CodeEditorContribution] })
export class CodeMirrorEditorContribution implements CodeEditorContribution {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canHandle(mime: string): number {
    // default editor
    return 50;
  }
  factory: CodeEditorFactory = codeMirrorEditorFactory;
}
