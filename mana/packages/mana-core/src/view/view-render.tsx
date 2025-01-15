import { useInject } from '@difizen/mana-observable';
import type { ReactNode } from 'react';
import { memo } from 'react';

import { isWrapperViewComponent } from './view-container';
import { ViewContext } from './view-context';
import type { View } from './view-protocol';
import { OriginViewComponent } from './view-protocol';
import { ViewComponent } from './view-protocol';

// import { ViewManager } from './view-manager';

export interface ViewRenderProps {
  view: View;
  shadow?: boolean;
  children?: ReactNode | ReactNode[];
}

const ViewComponentRender = (props: ViewRenderProps) => {
  const { shadow, children } = props;
  const Component = useInject<ViewComponent>(ViewComponent);
  const OriginComponent = useInject<ViewComponent>(OriginViewComponent);
  return shadow ? (
    <OriginComponent {...props}>{children}</OriginComponent>
  ) : (
    <Component {...props}>{children}</Component>
  );
};
export const ViewRender = memo(function ViewRender(props: ViewRenderProps) {
  const { view, shadow } = props;
  if (isWrapperViewComponent(view.view) && !shadow) {
    return <view.view {...props} />;
  }
  return (
    <ViewContext view={view}>
      <ViewComponentRender {...props} />
    </ViewContext>
  );
});
