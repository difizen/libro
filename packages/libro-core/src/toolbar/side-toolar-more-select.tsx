import type { Toolbar } from '@difizen/mana-app';
import { isMacintosh } from '@difizen/mana-app';
import {
  CommandRegistry,
  getOrigin,
  ToolbarInstance,
  useInject,
  useObserve,
} from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { Menu, MenuContext } from '@difizen/mana-react';
import { Popover } from 'antd';

import { ExecutableCellModel, ExecutableCellView } from '../cell/index.js';
import { NotebookCommands } from '../command/index.js';
import type { LibroSideToolbarMenuItemType } from '../components/libro-side-toolbar-menu.js';
import { MoreOutlined } from '../material-from-designer.js';

import type { LibroToolbarArags } from './libro-toolbar-protocol.js';

export const LibroSideToolbarMoreMenu: React.FC = () => {
  const command = useInject(CommandRegistry);
  const toolbar = useInject<Toolbar>(ToolbarInstance);
  const data = toolbar.currentArgs as LibroToolbarArags;
  const args = getOrigin(data) || [];
  const cell = useObserve(args[0]);
  const codeItems: LibroSideToolbarMenuItemType[] = [
    {
      id: NotebookCommands['HideCellCode'].id,
      label: (
        <>
          <span className="libro-menu-item-label">{l10n.t('隐藏 Code')}</span>
          <span className="libro-menu-item-keybind">
            {`${isMacintosh ? 'Cmd' : 'Ctrl'} + `}&apos;
          </span>
        </>
      ),
    },
    {
      id: NotebookCommands['ShowCellCode'].id,
      label: (
        <>
          <span className="libro-menu-item-label">{l10n.t('显示 Code')}</span>
          <span className="libro-menu-item-keybind">
            {`${isMacintosh ? 'Cmd' : 'Ctrl'} + `}&apos;
          </span>
        </>
      ),
    },
  ];

  const outputItems: LibroSideToolbarMenuItemType[] = [
    {
      id: NotebookCommands['HideCellOutputs'].id,
      label: (
        <>
          <span className="libro-menu-item-label">{l10n.t('隐藏 Output')}</span>
          <span className="libro-menu-item-keybind">{`${isMacintosh ? 'Cmd' : 'Ctrl'} + O`}</span>
        </>
      ),
    },
    {
      id: NotebookCommands['ShowCellOutputs'].id,
      label: (
        <>
          <span className="libro-menu-item-label">{l10n.t('显示 Output')}</span>
          <span className="libro-menu-item-keybind">{`${isMacintosh ? 'Cmd' : 'Ctrl'} + O`}</span>
        </>
      ),
    },
  ];

  const moreItems: LibroSideToolbarMenuItemType[] = [
    {
      id: NotebookCommands['CopyCell'].id,
      label: (
        <>
          <span className="libro-menu-item-label">{l10n.t('复制')}</span>
          <span className="libro-menu-item-keybind">C</span>
        </>
      ),
    },
    {
      id: NotebookCommands['CutCell'].id,
      label: (
        <>
          <span className="libro-menu-item-label">{l10n.t('剪切')}</span>
          <span className="libro-menu-item-keybind">X</span>
        </>
      ),
    },
    {
      id: NotebookCommands['PasteCellBelow'].id,
      label: (
        <>
          <span className="libro-menu-item-label">{l10n.t('粘贴')}</span>
          <span className="libro-menu-item-keybind">V</span>
        </>
      ),
    },
  ];
  if (!cell) {
    return null;
  }
  const hasOutput =
    ExecutableCellView.is(cell) && cell.outputArea?.length && cell.outputArea.length > 0
      ? true
      : false;
  const nodes: React.ReactNode[] = [];
  const baseCls = 'mana-menu';
  const contextValue: MenuContext.Context = {
    prefixCls: baseCls,
  };
  const codeMenuItem = cell.hasInputHidden ? 1 : 0;
  nodes.push(
    <Menu.Item
      key={codeItems[codeMenuItem].id}
      onClick={() => {
        command.executeCommand(codeItems[codeMenuItem].id, ...args);
        cell.hasInputHidden = !cell.hasInputHidden;
      }}
    >
      {codeItems[codeMenuItem].label}
    </Menu.Item>,
  );
  const outputMenuItem =
    ExecutableCellModel.is(cell.model) && cell.model.hasOutputHidden ? 1 : 0;
  nodes.push(
    <Menu.Item
      key={outputItems[outputMenuItem].id}
      onClick={() => {
        if (hasOutput) {
          command.executeCommand(outputItems[outputMenuItem].id, ...args);
          if (ExecutableCellModel.is(cell.model)) {
            cell.model.hasOutputHidden = !cell.model.hasOutputHidden;
          }
        }
      }}
      disabled={!hasOutput}
    >
      {outputItems[outputMenuItem].label}
    </Menu.Item>,
  );
  nodes.push(<Menu.Divider key="libro-menu-divider" />);
  moreItems.forEach((item) => {
    nodes.push(
      <Menu.Item
        key={item.id}
        onClick={() => {
          command.executeCommand(item.id, ...args);
        }}
      >
        {item.label}
      </Menu.Item>,
    );
  });
  return (
    <div className="libro-side-toolbar-menu">
      <MenuContext.Provider value={contextValue}>{nodes} </MenuContext.Provider>
    </div>
  );
};

export const SideToolbarMoreSelect: React.FC = () => {
  return (
    <Popover
      placement="leftTop"
      content={<LibroSideToolbarMoreMenu />}
      trigger="click"
      overlayClassName="libro-popover-side-toolbar-menu libro-side-toolbar-more-select-menu"
    >
      <span>
        <MoreOutlined />
      </span>
    </Popover>
  );
};
