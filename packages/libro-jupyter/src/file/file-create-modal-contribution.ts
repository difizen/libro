import { ModalContribution, singleton } from '@difizen/libro-common/mana-app';

import { FileCreateModal } from './file-create-modal.js';

@singleton({ contrib: ModalContribution })
export class FileCreateModalContribution implements ModalContribution {
  registerModal() {
    return FileCreateModal;
  }
}
