import React from 'react';

import type {
  LibroPanelCollapseItemType,
  LibroPanelCollapseKernelItem,
} from '../kernel.panel.protocol';

import { LibroKernelCollapseContentItem } from './kernel-collapse-content-item';

interface Props {
  type: LibroPanelCollapseItemType;
  items: LibroPanelCollapseKernelItem[];
  refresh: () => void;
}

export const LibroKernelCollapseContent: React.FC<Props> = (props: Props) => {
  return (
    <>
      {props.items.map((item) => {
        return (
          <LibroKernelCollapseContentItem
            item={item}
            key={item.id}
            refresh={props.refresh}
          />
        );
      })}
    </>
  );
};
