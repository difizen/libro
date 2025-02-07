import { ManaAppPreset, ManaModule } from '@difizen/libro-common/app';
import { l10n } from '@difizen/libro-common/l10n';

import { langBundles } from '../lang/index';

import { Github } from './github.js';

export const DumiPreset = ManaModule.create()
  .preload(() => {
    l10n.loadLangBundles(langBundles);
    return Promise.resolve();
  })
  .register(Github)
  .dependOn(ManaAppPreset);
