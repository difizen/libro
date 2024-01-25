import { CloseOutlined } from '@ant-design/icons';
import { TerminalCommands } from '@difizen/libro-terminal';
import { CommandRegistry, useInject } from '@difizen/mana-app';
import { message } from 'antd';
import React from 'react';

import {
  existedLSP,
  openedPage,
  runningKernel,
  runningTerminal,
} from '../../common/icon.js';

import { LibroPanelCollapseItemType } from './index.js';
import type { LibroPanelCollapseItem } from './index.js';

export const getIcon = (type: LibroPanelCollapseItemType) => {
  switch (type) {
    case LibroPanelCollapseItemType.PAGE:
      return openedPage();
    case LibroPanelCollapseItemType.KERNEL:
      return runningKernel();
    case LibroPanelCollapseItemType.TERMINAL:
      return runningTerminal();
    case LibroPanelCollapseItemType.LSP:
      return existedLSP();
  }
};

interface Props {
  type: LibroPanelCollapseItemType;
  items: LibroPanelCollapseItem[];
}

export const LibroCollapseContent: React.FC<Props> = (props: Props) => {
  const commandRegistry = useInject<CommandRegistry>(CommandRegistry);

  return (
    <>
      {props.items.map((item) => {
        return (
          <div
            className="libro-panel-collapse-item"
            key={item.id}
            onClick={() => {
              if (props.type === LibroPanelCollapseItemType.TERMINAL) {
                commandRegistry.executeCommand(
                  TerminalCommands['OpenTerminal'].id,
                  item.name,
                );
              }
            }}
          >
            <div className="libro-panel-collapse-item-icon">{getIcon(props.type)}</div>
            <div className="libro-panel-collapse-item-label">{item.name}</div>
            <div
              className="libro-panel-collapse-item-close"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (item.shutdown) {
                  item.shutdown().catch((error) => {
                    message.error(`shutdown ${props.type} failed`);
                    console.error(error);
                  });
                }
              }}
            >
              <CloseOutlined />
            </div>
          </div>
        );
      })}
    </>
  );
};
