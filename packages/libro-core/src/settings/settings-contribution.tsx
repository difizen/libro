import { ModalContribution, singleton, ToolbarContribution } from '@difizen/mana-app';
import type { ToolbarRegistry } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';

import { DocumentCommands } from '../command/document-commands.js';

import { SettingsModal } from './settings-modal.js';

@singleton({ contrib: [ModalContribution, ToolbarContribution] })
export class SettingsContribution implements ModalContribution, ToolbarContribution {
  registerModal() {
    return SettingsModal;
  }

  registerToolbarItems(registry: ToolbarRegistry) {
    registry.registerItem({
      id: DocumentCommands['OpenSettings'].id,
      icon: DocumentCommands['OpenSettings'].icon,
      command: DocumentCommands['OpenSettings'].id,
      order: 'z',
      tooltip: l10n.t('设置'),
    });
  }
}
