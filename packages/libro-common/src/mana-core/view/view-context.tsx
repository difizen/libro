import { getOrigin, ObservableContext } from '@difizen/mana-observable';
import * as React from 'react';

import type { ManaContext } from '../module';

import { ViewMeta } from './view-meta';
import type { View } from './view-protocol';

export interface ViewContextProps {
  view: View;
  children: React.ReactNode | React.ReactNode[];
}

interface ViewContextRenderProps {
  context?: ManaContext;
  children: React.ReactNode | React.ReactNode[];
}

const ViewContextRender = React.memo(function ViewContextRender(
  props: ViewContextRenderProps,
) {
  const { context, children } = props;
  if (context) {
    return (
      <ObservableContext.Provider value={{ getContainer: () => context.container }}>
        {children}
      </ObservableContext.Provider>
    );
  }
  return <></>;
});

export const ViewContext = (props: ViewContextProps) => {
  const { view, children } = props;
  const manaContext = ViewMeta.getViewContext(getOrigin(view));
  return <ViewContextRender context={manaContext}>{children}</ViewContextRender>;
};
