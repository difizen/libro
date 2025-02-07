import { PlayCircleOutlined } from '@ant-design/icons';
import type { LibroToolbarArags, LibroView } from '@difizen/libro-core';
import { NotebookCommands, ExecutableCellModel } from '@difizen/libro-core';
import { ServerManager } from '@difizen/libro-kernel';
import {
  useInject,
  ToolbarInstance,
  getOrigin,
  CommandRegistry,
  ViewInstance,
  ConfigurationService,
} from '@difizen/mana-app';
import type { Toolbar } from '@difizen/mana-app';
import { l10n } from '@difizen/libro-common/mana-l10n';
import { Menu, Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { useEffect, useState } from 'react';

import { LibroJupyterConfiguration } from '../config/config.js';
import type { LibroJupyterModel } from '../libro-jupyter-model.js';
import { kernelPrepared } from '../utils/index.js';

export const RunSelector: React.FC = () => {
  const libroView = useInject<LibroView>(ViewInstance);
  const libroModel = libroView ? libroView.model : undefined;
  const toolbar = useInject<Toolbar>(ToolbarInstance);
  const libroServerManager = useInject(ServerManager);
  const data = toolbar.currentArgs as LibroToolbarArags;
  const command = useInject(CommandRegistry);
  const curCell = data?.[0];
  const configService = useInject<ConfigurationService>(ConfigurationService);
  const isRunVisible =
    ExecutableCellModel.is(curCell?.model) && !curCell?.model.executing ? true : false;
  const isKernelPrepared = kernelPrepared(
    libroServerManager,
    libroModel as LibroJupyterModel,
  );

  const [kernelUnreadyBtnText, setKernelUnreadyBtnText] = useState<string>(
    l10n.t('kernel准备中，无法执行'),
  );

  useEffect(() => {
    configService
      .get(LibroJupyterConfiguration['KernelUnreadyBtnText'])
      .then((value) => {
        setKernelUnreadyBtnText(value);
        return;
      })
      .catch(() => {
        //
      });
  });

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
              <span className="libro-run-menu-label">{l10n.t('运行当前 Cell')}</span>
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
              <span className="libro-run-menu-label">
                {l10n.t('运行之前所有 Cell')}
              </span>
              <span className="libro-run-menu-keybind">Cmd + F8</span>
            </>
          ),
        },
        {
          key: 'runAllBelow',
          label: (
            <>
              <span className="libro-run-menu-label">
                {l10n.t('运行当前及之后 Cell')}
              </span>
              <span className="libro-run-menu-keybind">Cmd + F10</span>
            </>
          ),
        },
      ]}
    />
  );

  if (isKernelPrepared) {
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
      title={l10n.t(kernelUnreadyBtnText)}
    >
      <PlayCircleOutlined />
    </Tooltip>
  );
};
