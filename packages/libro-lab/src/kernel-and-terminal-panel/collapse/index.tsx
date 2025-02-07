import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';
import { ViewContext } from '@difizen/libro-common/mana-app';
import { l10n } from '@difizen/libro-common/mana-l10n';
import { Empty, message, Popconfirm } from 'antd';
import React, { useState } from 'react';

import type { SaveableTabView } from '../../index.js';

import { LibroCollapseContent } from './collapse-content.js';
import './index.less';
import { LibroKernelCollapseContent } from './kernel-collapse-content.js';
import { OpenedTabs } from './page-collapse-content.js';

export enum LibroPanelCollapseItemType {
  PAGE = 'Page',
  KERNEL = 'Kernel',
  TERMINAL = 'Terminal',
  LSP = 'LSP',
}

export interface LibroPanelCollapseItem {
  id: string;
  name: string;
  shutdown?: () => Promise<void>;
  restart?: () => Promise<void>;
}

export interface LibroPanelCollapseKernelItem extends LibroPanelCollapseItem {
  notebooks: { sessionId: string; name: string; path: string }[];
}

interface Props {
  type: LibroPanelCollapseItemType;
  items: LibroPanelCollapseItem[] | undefined;
  tabView?: SaveableTabView;
  shutdownAll?: () => Promise<void>;
}

const getCollapseContentView = (
  type: LibroPanelCollapseItemType,
  items: LibroPanelCollapseItem[] | undefined,
  tabView?: SaveableTabView,
) => {
  if (!items) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={l10n.t('暂无内容')}
        className="kernel-and-terminal-panel-empty"
      />
    );
  }

  switch (type) {
    case LibroPanelCollapseItemType.PAGE:
      return (
        <ViewContext view={tabView!}>
          <OpenedTabs />
        </ViewContext>
      );

    case LibroPanelCollapseItemType.KERNEL:
      return (
        <LibroKernelCollapseContent
          type={type}
          items={items as LibroPanelCollapseKernelItem[]}
        />
      );

    case LibroPanelCollapseItemType.TERMINAL:
    case LibroPanelCollapseItemType.LSP:
      return <LibroCollapseContent type={type} items={items!} />;
  }
};

const getCollapseHeaderLabel = (type: LibroPanelCollapseItemType) => {
  switch (type) {
    case LibroPanelCollapseItemType.PAGE:
      return l10n.t('已开启的标签页');
    case LibroPanelCollapseItemType.KERNEL:
      return l10n.t('运行的内核');
    case LibroPanelCollapseItemType.TERMINAL:
      return l10n.t('运行的终端');
    case LibroPanelCollapseItemType.LSP:
      return l10n.t('语言服务');
  }
};

export const LibroCollapse: React.FC<Props> = (props: Props) => {
  const [open, setOpen] = useState<boolean>(true);
  return (
    <div className="libro-panel-collapse-container" key={props.type}>
      <div className="libro-panel-collapse-header">
        <div
          className="libro-panel-collapse-header-left"
          onClick={() => {
            setOpen(!open);
          }}
        >
          <div className="libro-panel-collapse-header-icon">
            {open ? <CaretDownOutlined /> : <CaretRightOutlined />}
          </div>
          <div className="libro-panel-collapse-header-label">
            {getCollapseHeaderLabel(props.type)}
          </div>
        </div>
        <div className="libro-panel-collapse-header-closeAll">
          <Popconfirm
            title={l10n.t('你确定要关闭全部吗？')}
            okText={l10n.t('确定')}
            cancelText={l10n.t('取消')}
            onConfirm={() => {
              if (props.shutdownAll) {
                props.shutdownAll().catch((e) => {
                  message.error(`shutdown all ${props.type}s error`);
                  console.error(e);
                });
              }
            }}
          >
            {l10n.t('关闭全部')}
          </Popconfirm>
        </div>
      </div>
      {open && (
        <div className="libro-panel-collapse-content">
          {getCollapseContentView(props.type, props.items, props.tabView)}
        </div>
      )}
    </div>
  );
};
