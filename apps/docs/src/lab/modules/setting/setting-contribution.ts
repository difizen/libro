import { ModalContribution, singleton } from '@difizen/mana-app';

import { SettingModal } from './setting-modal.js';

@singleton({ contrib: ModalContribution })
export class SettingModalContribution implements ModalContribution {
  registerModal() {
    return SettingModal;
  }
}
