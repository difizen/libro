import type { Command } from '@difizen/libro-common/mana-app';
import { l10n } from '@difizen/libro-common/mana-l10n';

export const KernelCommands: Record<string, Command & { keybind?: string }> = {
  //#region libro command

  //#endregion

  //#region jupyterlab command
  ChangeKernel: {
    id: 'notebook:change-kernel',
    label: `Change Kernel`,
  },
  GetKernel: {
    id: 'notebook:get-kernel',
    label: `Get Kernel`,
  },
  InterruptKernel: {
    id: 'notebook:interrupt-kernel',
    label: `Interrupt Kernel`,
  },
  ReconnectToKernel: {
    id: 'notebook:reconnect-to-kernel',
    label: `Reconnect to Kernel`,
  },
  RestartKernel: {
    id: 'notebook:restart-kernel',
    label: l10n.t('Restart Kernel'),
  },
  ShutdownKernel: {
    id: 'notebook:shutdown-kernel',
    label: `Shutdown Kernel`,
  },
  ShowKernelStatus: {
    id: 'notebook:show-kernel-status',
  },
  // TODO: remove this command
  ShowKernelStatusAndSelector: {
    id: 'notebook:show-kernel-status-and-selector',
  },
  //#endregion
};
