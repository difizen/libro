import { ModalContribution, singleton } from '@difizen/mana-app';

import { ShutdownModal } from './shutdown-modal.js';

@singleton({ contrib: ModalContribution })
export class ShutdownContribution implements ModalContribution {
  registerModal() {
    return ShutdownModal;
  }
}
