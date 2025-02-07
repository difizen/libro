import { BaseView, view } from '@difizen/mana-core';
import { useInject } from '@difizen/mana-observable';
import { singleton } from '@difizen/mana-syringe';
import React from 'react';

import { ModalService } from './modal-service';

const ModalRender: React.FC = React.forwardRef(function ModalRender() {
  const modalService = useInject(ModalService);

  return (
    <div className="mana-modal-render">
      {modalService.modalViewList.map((item) => modalService.renderModal(item))}
    </div>
  );
});

@singleton()
@view('modal-render-view')
export class ModalRenderView extends BaseView {
  override view = ModalRender;
}
