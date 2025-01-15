import type { ModalItem, ModalItemProps } from '@difizen/mana-app';
import { ModalContribution, singleton } from '@difizen/mana-app';
import { ConfigProvider, Modal } from 'antd';

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

export const fooModal: ModalItem<string> = {
  id: 'foo-modal',
  component: DemoModal,
};
export const barModal: ModalItem<string> = {
  id: 'bar-modal',
  component: DemoModal,
  render: (props) => {
    return (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#00b96b',
            borderRadius: 2,
            colorBgContainer: '#f6ffed',
          },
        }}
      >
        <DemoModal {...props} />{' '}
      </ConfigProvider>
    );
  },
};

@singleton({ contrib: ModalContribution })
export class DemoModalContribution implements ModalContribution {
  registerModals(): ModalItem<string>[] {
    return [fooModal, barModal];
  }
}
