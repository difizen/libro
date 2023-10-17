import { PlayCircleOutlined } from '@ant-design/icons';
import type { LibroSideToolbarMenuItemType, LibroView } from '@difizen/libro-core';
import { NotebookCommands, LibroSideToolbarMenu } from '@difizen/libro-core';
import { useInject, ViewInstance } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { Popover, Tooltip } from 'antd';

import type { LibroJupyterModel } from '../libro-jupyter-model.js';

const items: LibroSideToolbarMenuItemType[] = [
  {
    id: NotebookCommands['RunCell'].id,
    label: (
      <>
        <span className="libro-menu-item-label">{l10n.t('运行 Cell')}</span>
        <span className="libro-menu-item-keybind">Cmd + Enter</span>
      </>
    ),

    group: 'runCell1',
  },
  {
    id: NotebookCommands['RunAllAbove'].id,
    label: (
      <>
        <span className="libro-menu-item-label">{l10n.t('运行上方所有 Cell')}</span>
        <span className="libro-menu-item-keybind">Cmd + F8</span>
      </>
    ),

    group: 'runCell2',
  },
  {
    id: NotebookCommands['RunAllBelow'].id,
    label: (
      <>
        <span className="libro-menu-item-label">
          {l10n.t('运行当前及下方所有 Cell')}
        </span>
        <span className="libro-menu-item-keybind">Cmd + F10</span>
      </>
    ),

    group: 'runCell2',
  },
];

export const SideToolbarRunSelector: React.FC = () => {
  const libroView = useInject<LibroView>(ViewInstance);
  const libroModel = libroView ? libroView.model : undefined;
  const isKernelIdle = libroModel
    ? (libroModel as LibroJupyterModel).isKernelIdle
    : false;

  if (isKernelIdle) {
    return (
      <Popover
        placement="leftTop"
        content={<LibroSideToolbarMenu items={items} />}
        trigger="hover"
        overlayClassName="libro-popover-side-toolbar-menu libro-side-toolbar-run-select-menu"
      >
        <PlayCircleOutlined />
      </Popover>
    );
  }

  return (
    <Tooltip
      overlayClassName="libro-tooltip-placement-right"
      placement="right"
      title={l10n.t('kernel准备中，无法执行')}
    >
      <PlayCircleOutlined />
    </Tooltip>
  );
};
