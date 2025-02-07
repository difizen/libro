import { ApplicationContribution } from '@difizen/mana-core';
import { inject } from '@difizen/mana-syringe';
import { singleton } from '@difizen/mana-syringe';

import { ModalService } from './modal-service';

@singleton({ contrib: [ApplicationContribution] })
export class ModalApplicationContribution implements ApplicationContribution {
  @inject(ModalService) modalService: ModalService;
  onStart() {
    this.modalService.init();
  }
}
