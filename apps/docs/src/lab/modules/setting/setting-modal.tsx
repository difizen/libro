import { SettingOutlined } from '@ant-design/icons';
import type { Command, ModalItem, ModalItemProps } from '@difizen/mana-app';
import { Drawer } from 'antd';

export const SideSettingCommand: Command = {
  id: 'max.workbench.setting',
  icon: <SettingOutlined style={{ fontSize: 16 }} />,
};

export const SettingModalComponent: React.FC<ModalItemProps<void>> = ({
  // eslint-disable-next-line react/prop-types
  visible,
  // eslint-disable-next-line react/prop-types
  close,
}) => {
  return (
    <Drawer
      title="系统设置"
      placement="right"
      width={600}
      onClose={() => {
        close();
      }}
      open={visible}
    >
      哈哈哈哈
    </Drawer>
  );
};

export const SettingModal: ModalItem = {
  id: SideSettingCommand.id,
  component: SettingModalComponent,
};
