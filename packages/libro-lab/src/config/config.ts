import type { ConfigurationNode } from '@difizen/libro-common/mana-app';
import { l10n } from '@difizen/libro-common/l10n';

export const LibroLabKernelAndTerminalPanelEnabled: ConfigurationNode<boolean> = {
  id: 'libro.lab.kernel.termianl.panel.enabled',
  description: 'whether enable kernel and terminal panel ',
  title: l10n.t('是否激活 kernel 与终端功能面板'),
  type: 'checkbox',
  defaultValue: true,
  schema: {
    type: 'boolean',
  },
};

export const LibroLabTocPanelEnabled: ConfigurationNode<boolean> = {
  id: 'libro.lab.toc.panel.enabled',
  description: 'whether enable toc panel ',
  title: l10n.t('是否激活 toc 功能面板'),
  type: 'checkbox',
  defaultValue: true,
  schema: {
    type: 'boolean',
  },
};

export const LibroLabGuideViewEnabled: ConfigurationNode<boolean> = {
  id: 'libro.lab.guide.view.enabled',
  description: 'whether enable guide view ',
  title: l10n.t('是否激活使用指南'),
  type: 'checkbox',
  defaultValue: false,
  schema: {
    type: 'boolean',
  },
};

export const LibroLabConfiguration = {
  LibroLabKernelAndTerminalPanelEnabled: LibroLabKernelAndTerminalPanelEnabled,
  LibroLabTocPanelEnabled: LibroLabTocPanelEnabled,
  LibroLabGuideViewEnabled: LibroLabGuideViewEnabled,
};
