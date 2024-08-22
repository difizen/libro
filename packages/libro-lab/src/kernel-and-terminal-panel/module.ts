import { createViewPreference, ManaModule } from '@difizen/mana-app';

import { LibroLabLayoutSlots } from '../layout/protocol.js';

import { KernelAndTerminalPanelView } from './kernel-and-terminal-panel-view.js';
import { KernelPanelColorContribution } from './kernel-color-registry.js';
import { PanelCommandContribution } from './panel-command.js';

export const LibroKernelAndTerminalPanelModule = ManaModule.create().register(
  PanelCommandContribution,
  KernelAndTerminalPanelView,
  KernelPanelColorContribution,
  createViewPreference({
    view: KernelAndTerminalPanelView,
    slot: LibroLabLayoutSlots.navigator,
    autoCreate: true,
    openOptions: {
      reveal: true,
      order: 'kernel',
    },
  }),
);
