import { ManaModule } from '@difizen/libro-common/app';

import { Drive } from './contents-drive.js';
import { ContentsManager } from './contents-manager.js';

export const LibroContentsModule = ManaModule.create().register(Drive, ContentsManager);
