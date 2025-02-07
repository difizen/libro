import { ModalContribution, singleton } from '@difizen/libro-common/mana-app';

import { FileRenameModal } from './file-rename-modal.js';

@singleton({ contrib: ModalContribution })
export class FileRenameModalContribution implements ModalContribution {
  registerModal() {
    return FileRenameModal;
  }
}
