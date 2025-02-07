import { InitializeContribution } from '@difizen/libro-cofine-editor-core';
import { singleton } from '@difizen/libro-common/mana-app';
import * as monaco from '@difizen/monaco-editor-core';

import { setTokensLanguage } from './theme-provider.js';

@singleton({ contrib: [InitializeContribution] })
export class JsonContribution implements InitializeContribution {
  onInitialize() {
    monaco.languages.register({
      id: 'json',
      extensions: ['.json'],
      aliases: ['JSON', 'json'],
      mimetypes: ['application/json'],
    });
    monaco.languages.onLanguage('json', () => {
      setTokensLanguage();
    });
  }
}
