import { ConfigurationContribution } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';

import { LibroMarkdownConfiguration } from './config.js';

@singleton({ contrib: ConfigurationContribution })
export class LibroMarkdownSettingContribution implements ConfigurationContribution {
  registerConfigurations() {
    return [LibroMarkdownConfiguration.TargetToBlank];
  }
}
