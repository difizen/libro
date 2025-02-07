import { ManaModule } from '@difizen/libro-common/app';

import { KernelAndTerminalPanelView } from './kernel-and-terminal-panel-view.js';
import { KernelPanelColorContribution } from './kernel-color-registry.js';
import { PanelCommandContribution } from './panel-command.js';

export const LibroKernelAndTerminalPanelModule = ManaModule.create().register(
  PanelCommandContribution,
  KernelAndTerminalPanelView,
  KernelPanelColorContribution,
);
