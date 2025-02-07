import { LibroConfigAutoSave } from '@difizen/libro-jupyter';
import { ConfigurationService } from '@difizen/libro-common/app';
import { ApplicationContribution } from '@difizen/libro-common/app';
import { inject, singleton } from '@difizen/libro-common/app';

@singleton({ contrib: ApplicationContribution })
export class LabConfigAppContribution implements ApplicationContribution {
  @inject(ConfigurationService) configurationService: ConfigurationService;
  onViewStart() {
    this.configurationService.set(LibroConfigAutoSave, true);
  }
}
