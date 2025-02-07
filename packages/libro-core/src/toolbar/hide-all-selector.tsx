import { EyeInvisibleOutlined } from '@ant-design/icons';
import {
  useInject,
  ToolbarInstance,
  getOrigin,
  CommandRegistry,
} from '@difizen/mana-app';
import type { Toolbar } from '@difizen/mana-app';
import { l10n } from '@difizen/libro-common/mana-l10n';
import { Menu, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { memo } from 'react';

import { ExecutableCellModel } from '../cell/index.js';
import { NotebookCommands } from '../command/index.js';

import type { LibroToolbarArags } from './libro-toolbar-protocol.js';
import './index.less';

export const HideAllSelectInner: React.FC = () => {
  const toolbar = useInject<Toolbar>(ToolbarInstance);
  const data = toolbar.currentArgs as LibroToolbarArags;
  // const data = useInject(ToolbarArgs) as LibroToolbarArags;
  const command = useInject(CommandRegistry);
  const libroView = data?.[1];
  if (!libroView) {
    return null;
  }
  const handleChange: MenuProps['onClick'] = (e) => {
    const args = getOrigin(data) || [];
    if (e.key === 'hideAllInputs') {
      command.executeCommand(NotebookCommands['HideAllCellCode'].id, ...args);
    } else if (e.key === 'hideAllOutputs') {
      command.executeCommand(NotebookCommands['HideAllCellOutput'].id, ...args);
    } else if (e.key === 'hideAll') {
      command.executeCommand(NotebookCommands['HideAllCellCode'].id, ...args);
      command.executeCommand(NotebookCommands['HideAllCellOutput'].id, ...args);
    } else if (e.key === 'showAllInputs') {
      command.executeCommand(NotebookCommands['ShowAllCellCode'].id, ...args);
    } else if (e.key === 'showAllOutputs') {
      command.executeCommand(NotebookCommands['ShowAllCellOutputs'].id, ...args);
    } else if (e.key === 'showAll') {
      command.executeCommand(NotebookCommands['ShowAllCellCode'].id, ...args);
      command.executeCommand(NotebookCommands['ShowAllCellOutputs'].id, ...args);
    }
  };
  //只要有一个cell input是显示的，隐藏cell input的选项都生效
  const isCodeVisiable =
    libroView.model.getCells().findIndex((item) => item.hasInputHidden === false) > -1
      ? true
      : false;
  //只要有一个cell input是隐藏的，显示cell input的选项都生效
  const isCodeHidden =
    libroView.model.getCells().findIndex((item) => item.hasInputHidden === true) > -1
      ? true
      : false;
  const isOutputVisible =
    libroView.model
      .getCells()
      .findIndex(
        (item) =>
          ExecutableCellModel.is(item.model) && item.model.hasOutputHidden === false,
      ) > -1
      ? true
      : false;
  const isOutputHidden =
    libroView.model
      .getCells()
      .findIndex(
        (item) =>
          ExecutableCellModel.is(item.model) && item.model.hasOutputHidden === true,
      ) > -1
      ? true
      : false;
  const menu = (
    <Menu
      onClick={handleChange}
      items={[
        {
          key: 'hideAllInputs',
          label: l10n.t('隐藏全部 Code'),
          disabled: !isCodeVisiable,
        },
        {
          key: 'hideAllOutputs',
          label: l10n.t('隐藏全部 Output'),
          disabled: !isOutputVisible,
        },
        {
          key: 'hideAll',
          label: l10n.t('全部隐藏'),
          disabled: !isCodeVisiable || !isOutputVisible,
        },
        {
          key: 'showAllInputs',
          label: l10n.t('显示全部 Code'),
          disabled: !isCodeHidden,
        },
        {
          key: 'showAllOutputs',
          label: l10n.t('显示全部 Output'),
          disabled: !isOutputHidden,
        },
        {
          key: 'showAll',
          label: l10n.t('全部显示'),
          disabled: !isCodeHidden || !isOutputHidden,
        },
      ]}
    />
  );

  return (
    <>
      <Dropdown
        overlay={menu}
        placement="bottomLeft"
        overlayClassName="libro-hide-selector-menu"
      >
        <EyeInvisibleOutlined style={{ fontSize: 20 }} />
      </Dropdown>
    </>
  );
};

export const HideAllSelect = memo(HideAllSelectInner);
