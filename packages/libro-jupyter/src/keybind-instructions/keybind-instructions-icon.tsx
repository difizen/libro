import { KeybindInstructionsOutlined } from '@difizen/libro-core';
import { ModalService, useInject } from '@difizen/libro-common/mana-app';
import type { FC } from 'react';

import {
  KeybindInstrutionsService,
  KeybindInstrutionModal,
} from './keybind-instructions-view.js';

export const KeybindInstructionsIcon: FC = () => {
  const keybindInstrutionsService = useInject(KeybindInstrutionsService);
  const modalService = useInject(ModalService);
  const handleClick = () => {
    modalService.openModal(KeybindInstrutionModal);
    keybindInstrutionsService.contextKey.disableCommandMode();
  };
  return (
    <div className="libro-keybind-instructions-icon" onClick={handleClick}>
      <KeybindInstructionsOutlined
        className="libro-keybind-instructions-icon-svg"
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
        }}
      />
    </div>
  );
};
