import type { CodeEditorFactory } from '@difizen/libro-code-editor';
import { CodeEditorContribution } from '@difizen/libro-code-editor';
import { MIME } from '@difizen/libro-common';
import { singleton } from '@difizen/libro-common/mana-app';

import { codeMirrorDefaultConfig } from './editor.js';
import { codeMirrorEditorFactory, stateFactory } from './factory.js';

@singleton({ contrib: [CodeEditorContribution] })
export class CodeMirrorEditorContribution implements CodeEditorContribution {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canHandle(mime: string): number {
    const mimes = [MIME.codemirror, MIME.text] as string[];
    if (mimes.includes(mime)) {
      return 50 + 1;
    }
    return 10;
  }
  factory: CodeEditorFactory = codeMirrorEditorFactory;
  stateFactory = stateFactory;
  defaultConfig = codeMirrorDefaultConfig;
}
