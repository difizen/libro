import { InitializeContribution } from '@difizen/libro-cofine-editor-core';
import { singleton } from '@difizen/libro-common/app';
import * as monaco from '@difizen/monaco-editor-core';

import { setTokensLanguage } from './theme-provider.js';

@singleton({ contrib: [InitializeContribution] })
export class JuliaContribution implements InitializeContribution {
  onInitialize() {
    monaco.languages.register({
      id: 'julia',
      extensions: ['.jl', '.JL'],
      aliases: ['Julia', 'julia'],
      mimetypes: ['text/x-julia', 'application/julia'],
    });
    monaco.languages.onLanguage('julia', () => {
      setTokensLanguage();
    });
  }
}
