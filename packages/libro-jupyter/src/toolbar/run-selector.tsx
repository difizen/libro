import { PlayCircleOutlined } from '@ant-design/icons';
import type { LibroToolbarArags, LibroView } from '@difizen/libro-core';
import { NotebookCommands, ExecutableCellModel } from '@difizen/libro-core';
import {
  useInject,
  ToolbarInstance,
  getOrigin,
  CommandRegistry,
  ViewInstance,
} from '@difizen/mana-app';
import type { Toolbar } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { Menu, Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';

import type { LibroJupyterModel } from '../libro-jupyter-model.js';

export const RunSelector: React.FC = () => {
  const libroView = useInject<LibroView>(ViewInstance);
  const libroModel = libroView ? libroView.model : undefined;
  const toolbar = useInject<Toolbar>(ToolbarInstance);
  const data = toolbar.currentArgs as LibroToolbarArags;
  const command = useInject(CommandRegistry);
  const curCell = data?.[0];
  const isRunVisible =
    ExecutableCellModel.is(curCell?.model) && !curCell?.model.executing ? true : false;
  const isKernelIdle = libroModel
    ? (libroModel as LibroJupyterModel).isKernelIdle
    : false;

  const handleChange: MenuProps['onClick'] = (e) => {
    const args = getOrigin(data) || [];
    if (e.key === 'runCell') {
      command.executeCommand(NotebookCommands['RunCell'].id, ...args);
    } else if (e.key === 'runAllCell') {
      command.executeCommand(NotebookCommands['RunAllCells'].id, ...args);
    } else if (e.key === 'runAllAbove') {
      command.executeCommand(NotebookCommands['RunAllAbove'].id, ...args);
    } else if (e.key === 'runAllBelow') {
      command.executeCommand(NotebookCommands['RunAllBelow'].id, ...args);
    }
  };

  const menu = (
    <Menu
      className="libro-run-menu-container"
      onClick={handleChange}
      items={[
        {
          key: 'runCell',
          label: (
            <>
              <span className="libro-run-menu-label">{l10n.t('运行当前Cell')}</span>
              <span className="libro-run-menu-keybind">Cmd + Enter</span>
            </>
          ),

          disabled: !isRunVisible,
        },
        {
          key: 'runAllCell',
          label: (
            <>
              <span className="libro-run-menu-label">{l10n.t('运行全部')}</span>
              <span className="libro-run-menu-keybind" />
            </>
          ),
        },
        {
          key: 'runAllAbove',
          label: (
            <>
              <span className="libro-run-menu-label">{l10n.t('运行之前所有cell')}</span>
              <span className="libro-run-menu-keybind">Cmd + F8</span>
            </>
          ),
        },
        {
          key: 'runAllBelow',
          label: (
            <>
              <span className="libro-run-menu-label">
                {l10n.t('运行当前及之后cell')}
              </span>
              <span className="libro-run-menu-keybind">Cmd + F10</span>
            </>
          ),
        },
      ]}
    />
  );

  if (isKernelIdle) {
    return (
      <Dropdown overlay={menu} placement="bottomLeft">
        <PlayCircleOutlined />
      </Dropdown>
    );
  }

  return (
    <Tooltip
      overlayClassName="libro-tooltip-placement-bottom"
      placement="bottom"
      title={l10n.t('kernel准备中，无法执行')}
    >
      <PlayCircleOutlined />
    </Tooltip>
  );
};
