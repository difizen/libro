import { InitializeContribution } from '@difizen/libro-cofine-editor-core';
import { singleton } from '@difizen/libro-common/app';
import * as monaco from '@difizen/monaco-editor-core';

import { setTokensLanguage } from './theme-provider.js';

@singleton({ contrib: [InitializeContribution] })
export class RContribution implements InitializeContribution {
  onInitialize() {
    monaco.languages.register({
      id: 'r',
      extensions: ['.r'],
      aliases: ['R', 'r'],
      mimetypes: ['text/x-r-source', 'text/x-r'],
    });
    monaco.languages.onLanguage('r', () => {
      setTokensLanguage();
    });
  }
}
