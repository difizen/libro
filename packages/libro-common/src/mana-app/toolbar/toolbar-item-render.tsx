import type { ToolbarItem } from '../../mana-core/index.js';
import { useObserve } from '../../observable/index.js';
import type { FC } from 'react';
import { memo } from 'react';

import type { Toolbar } from './toolbar';
import type { ToolbarItemState } from './toolbar-protocol';

interface ToolbarItemRenderProps {
  data: any;
  item: ToolbarItem;
  toolbar: Toolbar;
  state: ToolbarItemState;
}
function ToolbarItemRenderInner(props: ToolbarItemRenderProps) {
  const data = useObserve(props.data);
  const item = useObserve(props.item);
  const toolbar = useObserve(props.toolbar);
  const state = useObserve(props.state);
  return <>{toolbar.renderItem(data, item, state)}</>;
}
export const ToolbarItemRender: FC<ToolbarItemRenderProps> =
  memo(ToolbarItemRenderInner);
