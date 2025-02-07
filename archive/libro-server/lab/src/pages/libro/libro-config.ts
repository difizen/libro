import { LibroLabConfiguration } from '@difizen/libro-lab';
import { ConfigurationService } from '@difizen/mana-app';
import { ApplicationContribution } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';

@singleton({ contrib: ApplicationContribution })
export class LibroConfigAppContribution implements ApplicationContribution {
  @inject(ConfigurationService) configurationService: ConfigurationService;
  onViewStart() {
    this.configurationService.set(LibroLabConfiguration.LibroLabGuideViewEnabled, true);
  }
}
