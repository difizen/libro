import { ApplicationContribution } from '../../mana-core/index.js';
import { inject } from '../../ioc/index.js';
import { singleton } from '../../ioc/index.js';

import { ModalService } from './modal-service';

@singleton({ contrib: [ApplicationContribution] })
export class ModalApplicationContribution implements ApplicationContribution {
  @inject(ModalService) modalService: ModalService;
  onStart() {
    this.modalService.init();
  }
}
