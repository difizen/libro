import { ConfigurationContribution } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';

import { LibroJupyterConfiguration } from './libro-configuration.js';

@singleton({ contrib: ConfigurationContribution })
export class LibroConfigurationContribution implements ConfigurationContribution {
  registerConfigurations() {
    return [LibroJupyterConfiguration['OpenSlot']];
  }
}
