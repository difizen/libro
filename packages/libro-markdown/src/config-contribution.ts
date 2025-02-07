import { ConfigurationContribution } from '@difizen/libro-common/mana-app';
import { singleton } from '@difizen/libro-common/mana-app';

import { LibroMarkdownConfiguration } from './config.js';

@singleton({ contrib: ConfigurationContribution })
export class LibroMarkdownSettingContribution implements ConfigurationContribution {
  registerConfigurations() {
    return [LibroMarkdownConfiguration.TargetToBlank];
  }
}
