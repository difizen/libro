import { ObservableContext, useInject } from '@difizen/mana-observable';
import type { Syringe } from '@difizen/mana-syringe';
import * as React from 'react';

import { useMount, useUnmount } from '../utils/hooks';

import { useViewSize } from './hooks';
import { isForwardRefComponent } from './utils';
import type { View } from './view-protocol';
import type { ViewComponent } from './view-protocol';
import { OriginViewComponent } from './view-protocol';
import { ViewInstance } from './view-protocol';

import './index.less';

interface ViewContainerProps {
  component: ViewComponent;
  viewComponentProps: Record<string, any>;
  children: React.ReactNode;
}

export const ViewContainer = React.forwardRef<HTMLDivElement, ViewContainerProps>(
  function ViewContainer(props, containerRef) {
    const { viewComponentProps = {}, children, component } = props;
    const viewInstance = useInject<View>(ViewInstance);
    const Component = component;
    const className = viewInstance?.className ?? '';
    useMount(() => {
      if (typeof containerRef === 'object') {
        viewInstance.container = containerRef;
      }
      viewInstance.isVisible = true;
      viewInstance.onViewMount?.();
    });
    useUnmount(() => {
      viewInstance.isVisible = false;
      viewInstance.onViewUnmount?.();
    });

    useViewSize(viewInstance, containerRef);

    if (isForwardRefComponent(Component)) {
      return (
        <Component ref={containerRef} className={className} {...viewComponentProps}>
          {children}
        </Component>
      );
    }
    return (
      <div ref={containerRef} className={`mana-view-container ${className}`}>
        <Component {...viewComponentProps}>{children}</Component>
      </div>
    );
  },
);
export const ViewWrapper = (
  ViewComponent: React.FC | React.ForwardRefExoticComponent<any>,
  container: Syringe.Container,
) => {
  const ViewWrapperRender: WrapperViewComponent = ({
    children,
    ...props
  }: {
    children: React.ReactNode;
  }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    return (
      <ObservableContext.Provider value={{ getContainer: () => container }}>
        <ViewContainer
          ref={containerRef}
          component={ViewComponent}
          viewComponentProps={props}
        >
          {children}
        </ViewContainer>
      </ObservableContext.Provider>
    );
  };
  ViewWrapperRender[OriginViewComponent] = ViewComponent;
  return ViewWrapperRender;
};

type WrapperViewComponent = React.FC<{ children: React.ReactNode }> & {
  [OriginViewComponent]?: React.FC | React.ForwardRefExoticComponent<any>;
};

export function isWrapperViewComponent(
  component: any,
): component is WrapperViewComponent {
  return component && component[OriginViewComponent] !== undefined;
}
