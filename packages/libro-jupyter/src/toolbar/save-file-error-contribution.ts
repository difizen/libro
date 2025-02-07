import { ModalContribution, singleton } from '@difizen/libro-common/mana-app';

import { SaveFileErrorModal } from './save-file-error.js';

@singleton({ contrib: ModalContribution })
export class SaveFileErrorContribution implements ModalContribution {
  registerModal() {
    return SaveFileErrorModal;
  }
}
