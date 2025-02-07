import { ManaModule } from '../module';

import { Application, ApplicationContribution } from './application';
import { ApplicationStateService } from './application-state';
import { DefaultWindowService } from './default-window-service';

export * from './application';
export * from './application-state';

export const ApplicationModule = ManaModule.create()
  .contribution(ApplicationContribution)
  .register(ApplicationStateService, Application, DefaultWindowService);
