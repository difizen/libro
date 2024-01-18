import React from 'react';

import { LibroKernelCollapseContentItem } from './kernel-collapse-content-item.js';

import type {
  LibroPanelCollapseItemType,
  LibroPanelCollapseKernelItem,
} from './index.js';

interface Props {
  type: LibroPanelCollapseItemType;
  items: LibroPanelCollapseKernelItem[];
}

export const LibroKernelCollapseContent: React.FC<Props> = (props: Props) => {
  return (
    <>
      {props.items.map((item) => {
        return <LibroKernelCollapseContentItem item={item} key={item.id} />;
      })}
    </>
  );
};
