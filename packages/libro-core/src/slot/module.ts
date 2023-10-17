import { ManaModule } from '@difizen/mana-app';

import { LibroSlotManager } from './libro-slot-manager.js';
import { LibroExtensionSlotContribution } from './libro-slot-protocol.js';
import { LibroSlotView } from './libro-slot-view.js';

export const LibroSlotModule = ManaModule.create()
  .contribution(LibroExtensionSlotContribution)
  .register(LibroSlotManager, LibroSlotView);
