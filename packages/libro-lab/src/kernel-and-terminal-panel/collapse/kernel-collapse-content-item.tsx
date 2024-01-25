import {
  CaretDownOutlined,
  CaretRightOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { OpenerService, URI, useInject } from '@difizen/mana-app';
import React, { useState } from 'react';

import { fileUnderKernel, runningKernel } from '../../common/icon.js';

import type { LibroPanelCollapseKernelItem } from './index.js';

interface Props {
  item: LibroPanelCollapseKernelItem;
}

export const LibroKernelCollapseContentItem: React.FC<Props> = (props: Props) => {
  const item = props.item;
  const [open, setOpen] = useState<boolean>(true);
  const openService = useInject<OpenerService>(OpenerService);

  return (
    <>
      <div
        className="libro-panel-collapse-item"
        key={item.id}
        onClick={() => {
          setOpen(!open);
        }}
      >
        <div className="libro-panel-collapse-item-toggle">
          {open ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </div>
        <div className="libro-panel-collapse-item-icon">{runningKernel()}</div>
        <div className="libro-panel-collapse-item-label">{item.name}</div>
        <div
          className="libro-panel-collapse-item-close"
          onClick={async (e) => {
            if (item.shutdown) {
              item.shutdown().catch((error) => {
                console.error(error);
              });
            }
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <CloseOutlined />
        </div>
      </div>
      {open && (
        <div className="libro-panel-collapse-kernel-item-container">
          {item.notebooks.map((notebook) => (
            <div
              className="libro-panel-collapse-kernel-item"
              key={notebook.sessionId}
              onClick={() => {
                const uri = new URI(notebook.path);
                const name = notebook.name;
                openService
                  .getOpener(uri)
                  .then((opener) => {
                    if (opener) {
                      opener.open(uri, {
                        viewOptions: {
                          name: name,
                        },
                      });
                    }
                    return;
                  })
                  .catch((e) => {
                    console.error(e);
                  });
              }}
            >
              <div className="libro-panel-collapse-kernel-item-icon">
                {fileUnderKernel()}
              </div>
              <div className="libro-panel-collapse-kernel-item-name">
                {notebook.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
