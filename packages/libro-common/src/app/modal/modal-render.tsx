import { BaseView, view } from '../../core/index.js';
import { useInject } from '../../observable/index.js';
import { singleton } from '../../ioc/index.js';
import React from 'react';

import { ModalService } from './modal-service.js';

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
