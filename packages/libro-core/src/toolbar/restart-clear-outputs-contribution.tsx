import { ModalContribution, singleton } from '@difizen/libro-common/app';

import { RestartClearOutputModal } from './restart-clear-outputs-modal.js';

@singleton({ contrib: ModalContribution })
export class RestartClearOutputsContribution implements ModalContribution {
  registerModal() {
    return RestartClearOutputModal;
  }
}
