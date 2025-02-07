import { ApplicationContribution } from '@difizen/mana-core';
import { inject } from '../../mana-syringe/index.js';
import { singleton } from '../../mana-syringe/index.js';

import { ModalService } from './modal-service';

@singleton({ contrib: [ApplicationContribution] })
export class ModalApplicationContribution implements ApplicationContribution {
  @inject(ModalService) modalService: ModalService;
  onStart() {
    this.modalService.init();
  }
}
