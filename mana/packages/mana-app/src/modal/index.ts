import { createViewPreference, ManaModule, PortalSlotId } from '@difizen/mana-core';

import { ModalApplicationContribution } from './modal-contribution';
import { ModalContribution } from './modal-protocol';
import { ModalRenderView } from './modal-render';
import { ModalService } from './modal-service';

export * from './modal-render';
export * from './modal-service';
export * from './modal-protocol';
export * from './modal-contribution';

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
