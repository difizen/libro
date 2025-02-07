import type { ToolbarItem } from '@difizen/mana-core';
import { useObserve } from '@difizen/mana-observable';
import { memo } from 'react';

import type { Toolbar } from './toolbar';

interface ToolbarVisiblesRenderProps {
  toolbar: Toolbar;
}
export const ToolbarVisiblesRender = memo(function ToolbarVisiblesRender(
  props: ToolbarVisiblesRenderProps,
) {
  const { toolbar: propsToolbar } = props;
  const toolbar = useObserve(propsToolbar);
  const inlines: ToolbarItem[] = [];
  const more: ToolbarItem[] = [];
  toolbar.visibleItems.forEach((item) =>
    toolbar.isInline(item) ? inlines.push(item) : more.push(item),
  );
  return toolbar.renderToolbar(inlines, more);
});
