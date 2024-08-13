import { AutoInsertWhenNoCell, EnterEditModeWhenAddCell } from '@difizen/libro-core';
import { ConfigurationContribution, ConfigurationService } from '@difizen/mana-app';
import { ApplicationContribution } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';

import { LibroJupyterConfiguration } from './config.js';

@singleton({ contrib: ConfigurationContribution })
export class LibroJupyterSettingContribution implements ConfigurationContribution {
  registerConfigurations() {
    return [
      LibroJupyterConfiguration.AutoSave,
      LibroJupyterConfiguration.OpenSlot,
      LibroJupyterConfiguration.AllowDownload,
      LibroJupyterConfiguration.AllowUpload,
      LibroJupyterConfiguration.AllowPreferredSession,
      LibroJupyterConfiguration.KernelUnreadyBtnText,
      LibroJupyterConfiguration.KernelUnreadyText,
    ];
  }
}
@singleton({ contrib: ApplicationContribution })
export class ConfigAppContribution implements ApplicationContribution {
  @inject(ConfigurationService) configurationService: ConfigurationService;
  onViewStart() {
    this.configurationService.set(AutoInsertWhenNoCell, true);
    this.configurationService.set(EnterEditModeWhenAddCell, false);
  }
}
