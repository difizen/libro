import { createViewPreference, ManaModule, PortalSlotId } from '../../core/index.js';

import { ModalApplicationContribution } from './modal-contribution.js';
import { ModalContribution } from './modal-protocol.js';
import { ModalRenderView } from './modal-render.js';
import { ModalService } from './modal-service.js';

export * from './modal-render.js';
export * from './modal-service.js';
export * from './modal-protocol.js';
export * from './modal-contribution.js';

export const ModalModule = ManaModule.create()
  .register(
    ModalService,
    ModalRenderView,
    ModalApplicationContribution,
    createViewPreference({
      view: ModalRenderView,
      slot: PortalSlotId,
      autoCreate: true,
    }),
  )
  .contribution(ModalContribution);

// @TODO 兼容break，下个大版本删除
export const ModalRender: React.FC = () => {
  return null;
};
