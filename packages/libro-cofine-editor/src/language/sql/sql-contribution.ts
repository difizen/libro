import { InitializeContribution } from '@difizen/libro-cofine-editor-core';
import { singleton } from '@difizen/libro-common/mana-app';
import * as monaco from '@difizen/monaco-editor-core';

import { id } from './config.js';
import { setTokensLanguage } from './theme-provider.js';

@singleton({ contrib: [InitializeContribution] })
export class SqlContribution implements InitializeContribution {
  onInitialize() {
    monaco.languages.register({
      id,
      extensions: ['.sql'],
      aliases: ['sql', 'odps'],
      mimetypes: ['text/sql'],
    });
    monaco.languages.onLanguage(id, () => {
      setTokensLanguage();
    });
  }
}
