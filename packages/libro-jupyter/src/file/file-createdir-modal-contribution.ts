import { ModalContribution, singleton } from '@difizen/libro-common/mana-app';

import { FileDirCreateModal } from './file-createdir-modal.js';

@singleton({ contrib: ModalContribution })
export class FileCreateDirModalContribution implements ModalContribution {
  registerModal() {
    return FileDirCreateModal;
  }
}
