import type { ModalItemProps, ModalItem } from '@difizen/libro-common/mana-app';
import { l10n } from '@difizen/libro-common/mana-l10n';
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
      title={l10n.t('清空输出并重启 Kernel？')}
      open={visible}
      onOk={handleRestart}
      onCancel={() => close()}
      width={'400px'}
      centered={true}
      className="libro-restart-kernel-modal"
      okText={l10n.t('确定')}
      cancelText={l10n.t('取消')}
    >
      {l10n.t('确定清空输出并重启当前 Kernel 吗？所有变量都将丢失。')}
    </Modal>
  );
}

export const RestartClearOutputModal: ModalItem<LibroView> = {
  id: NotebookCommands['RestartClearOutput'].id,
  component: RestartClearOutputModalComponent,
};
