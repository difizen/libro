import { ManaModule } from '../module';

import { DebugService, debug } from './debug';
import { StorageService } from './storage-protocol';
import { LocalStorageService, localStorageService } from './storage-service';

export * from './debug';
export * from './storage-service';
export * from './storage-protocol';

export const CommonModule = ManaModule.create()
  .register({
    token: StorageService,
    useValue: localStorageService,
  })
  .register({
    token: LocalStorageService,
    useValue: localStorageService,
  })
  .register({
    token: DebugService,
    useValue: debug,
  });
