import type { ModalItem, ModalItemProps } from '@difizen/mana-app';
import { ModalContribution, singleton } from '@difizen/mana-app';
import { Modal } from 'antd';

export const DemoModal = (props: ModalItemProps<string>) => {
  const { visible, data, close } = props;
  return (
    <Modal
      open={visible}
      onOk={() => {
        close();
      }}
      onCancel={() => {
        close();
      }}
    >
      <div>{data}</div>
    </Modal>
  );
};

export const demoModal: ModalItem<string> = {
  id: 'demo-modal',
  component: DemoModal,
};

@singleton({ contrib: ModalContribution })
export class DemoModalContribution implements ModalContribution {
  registerModals(): ModalItem<string>[] {
    return [demoModal];
  }
}
