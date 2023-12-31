import { ModalContribution, singleton } from '@difizen/mana-app';

import { RestartClearOutputModal } from './restart-clear-outputs-modal.js';

@singleton({ contrib: ModalContribution })
export class RestartClearOutputsContribution implements ModalContribution {
  registerModal() {
    return RestartClearOutputModal;
  }
}
