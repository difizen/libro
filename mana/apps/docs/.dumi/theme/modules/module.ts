import { ManaAppPreset, ManaModule } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';

import { langBundles } from '../lang/index.js';

import { Github } from './github.js';

export const DumiPreset = ManaModule.create()
  .preload(() => {
    l10n.loadLangBundles(langBundles);
    return Promise.resolve();
  })
  .register(Github)
  .dependOn(ManaAppPreset);
