import type { ModalItemProps, ModalItem } from '@difizen/mana-app';
import { Modal } from 'antd';
import { useCallback } from 'react';

import { NotebookCommands } from '../command/index.js';
import type { LibroView } from '../libro-view.js';

export function RestartClearOutputModalComponent({
  visible,
  close,
  data,
}: ModalItemProps<LibroView>) {
  const handleRestart = useCallback(() => {
    data?.restartClearOutput();
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <Modal
      title="Restart Kernel?"
      open={visible}
      onOk={handleRestart}
      onCancel={() => close()}
      width={'400px'}
      centered={true}
      className="libro-restart-kernel-modal"
    >
      Do you want to restart the current kernel? All variables will be lost.
    </Modal>
  );
}

export const RestartClearOutputModal: ModalItem<LibroView> = {
  id: NotebookCommands['RestartClearOutput'].id,
  component: RestartClearOutputModalComponent,
};
