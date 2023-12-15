import { LibroConfigAutoSave } from '@difizen/libro-jupyter';
import { ConfigurationService } from '@difizen/mana-app';
import { ApplicationContribution } from '@difizen/mana-app';
import { inject, singleton } from '@difizen/mana-app';

@singleton({ contrib: ApplicationContribution })
export class LabConfigAppContribution implements ApplicationContribution {
  @inject(ConfigurationService) configurationService: ConfigurationService;
  onViewStart() {
    this.configurationService.set(LibroConfigAutoSave, true);
  }
}
