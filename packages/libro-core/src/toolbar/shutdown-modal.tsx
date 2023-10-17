import type { ModalItemProps, ModalItem } from '@difizen/mana-app';
import { Modal } from 'antd';
import { useCallback } from 'react';

import { NotebookCommands } from '../command/index.js';
import type { LibroView } from '../libro-view.js';

export const ShutdownModalComponent: React.FC<ModalItemProps<LibroView>> = ({
  visible,
  close,
  data,
}: ModalItemProps<LibroView>) => {
  const handleShutdown = useCallback(() => {
    data?.closeAndShutdown();
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <Modal
      title="Shutdown Kernel?"
      open={visible}
      onOk={handleShutdown}
      onCancel={() => close()}
      width={'400px'}
      centered={true}
      className="libro-shut-down-kernel-modal"
    >
      Do you want to shutdown the current kernel?.
    </Modal>
  );
};

export const ShutdownModal: ModalItem<LibroView> = {
  id: NotebookCommands['CloseAndShutdown'].id,
  component: ShutdownModalComponent,
};
