import { ManaModule } from '../module';

import { SelectionService } from './selection-service';

export const SelectionModule = ManaModule.create().register(SelectionService);

export * from './selection-service';
