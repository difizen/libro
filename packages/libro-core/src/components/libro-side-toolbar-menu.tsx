import { Menu, MenuContext } from '@difizen/libro-common/react';
import type { Toolbar } from '@difizen/libro-common/app';
import {
  CommandRegistry,
  getOrigin,
  ToolbarInstance,
  useInject,
} from '@difizen/libro-common/app';
import type { ReactNode } from 'react';

import type { LibroToolbarArags } from '../toolbar/index.js';

export type LibroSideToolbarMenuItemType = {
  id: string;
  label: ReactNode;
  /**
   * When extra, group means that the item will be located in a submenu(s) of the `...` dropdown.
   * The submenu's title is named by the name in group, e.g. ['menu', 'submenu'].
   */
  readonly group?: string | string[];
  disabled?: boolean;
};

interface LibroSideToolbarMenuInlinesProps {
  items: LibroSideToolbarMenuItemType[];
}

export const LibroSideToolbarMenuInlines: React.FC<
  LibroSideToolbarMenuInlinesProps
> = ({ items }: LibroSideToolbarMenuInlinesProps) => {
  const command = useInject(CommandRegistry);
  const toolbar = useInject<Toolbar>(ToolbarInstance);
  const data = toolbar.currentArgs as LibroToolbarArags;
  const args = getOrigin(data) || [];
  if (!items.length) {
    return null;
  }
  const nodes: React.ReactNode[] = [];
  let group: string | undefined = undefined;
  const baseCls = 'mana-menu';
  const contextValue: MenuContext.Context = {
    prefixCls: baseCls,
  };
  items.forEach((item) => {
    let itemGroup: string | string[] | undefined = item.group;
    if (itemGroup) {
      itemGroup = typeof itemGroup === 'string' ? itemGroup : itemGroup[0];
    }
    if (nodes.length && itemGroup !== group) {
      nodes.push(itemGroup && <Menu.Divider key={`${item.id}-divider`} />);
    }
    group = itemGroup;
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
    <div className="libro-toolbar-menu-inlines">
      <MenuContext.Provider value={contextValue}>{nodes} </MenuContext.Provider>
    </div>
  );
};

interface LibroSideToolbarMenuProps {
  items: LibroSideToolbarMenuItemType[];
}
export const LibroSideToolbarMenu: React.FC<LibroSideToolbarMenuProps> = ({
  items,
}: LibroSideToolbarMenuProps) => {
  return (
    <div className="libro-side-toolbar-menu">
      <LibroSideToolbarMenuInlines items={items} />
    </div>
  );
};
