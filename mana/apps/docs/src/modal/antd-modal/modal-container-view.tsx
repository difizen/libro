import { BaseView, view } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';
import { ModalService, useInject } from '@difizen/mana-app';
import { Button } from 'antd';
import React from 'react';

import { demoModal } from './modal-contribution.js';

export const ModalContainerComponent: React.FC = () => {
  const modalService = useInject(ModalService);
  return (
    <div>
      <Button
        onClick={() => {
          modalService.openModal(demoModal, 'a new modal!');
        }}
      >
        打开弹窗
      </Button>
    </div>
  );
};

@singleton()
@view('modal-container')
export class ModalContainerView extends BaseView {
  override view = ModalContainerComponent;
}
