import type { ToolbarItem } from '@difizen/mana-core';
import { CommandRegistry } from '@difizen/mana-core';
import { observable, useObserve } from '@difizen/mana-observable';
import { useInject } from '@difizen/mana-observable';
import { memo } from 'react';
import type { Toolbar } from './toolbar';
import type { ToolbarItemData, ToolbarItemState } from './toolbar-protocol';

interface ToolbarItemKeeperProps {
  data: ToolbarItemData;
  item: ToolbarItem;
  toolbar: Toolbar;
}
const ToolbarItemKeeperInner = (props: ToolbarItemKeeperProps) => {
  const commands = useInject(CommandRegistry);
  const item = useObserve(props.item);
  const toolbar = useObserve(props.toolbar);

  const handleState = (...args: any[]): ToolbarItemState => {
    const visible = commands.isVisibleByHandler(item, item.command, ...args);
    let enable = false;
    let active = false;
    if (visible) {
      enable = commands.isEnabledByHandler(item, item.command, ...args);
      active = commands.isActiveByHandler(item, item.command, ...args);
    }
    return { id: item.id, visible, enable, active };
  };
  let data = useObserve(props.data);
  if (!Array.isArray(data)) {
    data = [data];
  }
  const newState = handleState(...data);
  const currentState = toolbar.getState(item);
  if (currentState) {
    const observableState = observable(currentState);
    observableState.visible = !!newState?.visible;
    observableState.enable = !!newState?.enable;
    observableState.active = !!newState?.active;
  } else {
    toolbar.setState(newState);
  }
  return null;
};
export const ToolbarItemKeeper = memo(ToolbarItemKeeperInner);
