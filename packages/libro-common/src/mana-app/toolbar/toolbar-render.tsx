/* eslint-disable @typescript-eslint/no-use-before-define */
import { ToolbarRegistry, ToolbarInstance, useUnmount } from '@difizen/mana-core';
import { useInject, ObservableContext } from '@difizen/mana-observable';
import type { Syringe } from '@difizen/mana-syringe';
import { useEffect, memo, useState, useContext, useMemo } from 'react';

import type { Toolbar } from './toolbar';
import { ToolbarFactory } from './toolbar';
import { ToolbarItemKeeper } from './toolbar-item-keeper';
import { ToolbarArgs } from './toolbar-protocol';
import { ToolbarVisiblesRender } from './toolbar-visible-render';

export interface ToolbarRenderProps {
  /**
   * 参数
   * @description       toolbar 传递的参数
   */
  data: any | any[];
  /**
   * 工厂函数
   * @description       获取 toolbar 实例的工厂函数，用于自定义
   */
  factory?: ToolbarFactory;
  /**
   * toolbar 实例
   * @description       可以传递已经存在的 toolbar 实例
   */
  toolbar?: Toolbar;
  /**
   * tooltip 设置
   * @description       设置 tooltip 的属性
   */
  tooltip?: { placement: string };
}
export const ToolbarRender = memo(function ToolbarRender(props: ToolbarRenderProps) {
  const { data, factory, tooltip } = props;
  const defaultFactory = useInject<ToolbarFactory>(ToolbarFactory);
  const registry = useInject<ToolbarRegistry>(ToolbarRegistry);
  const currentFactory = factory || defaultFactory;
  const [toolbar, setToolbar] = useState<Toolbar | undefined>(props.toolbar);
  const [contextReady, setContextReady] = useState<boolean>(false);
  const context = useContext(ObservableContext);
  const container = context.getContainer();

  const childContainer = useMemo(() => {
    return container?.createChild() as Syringe.Container;
  }, [container]);

  useEffect(() => {
    if (!props.toolbar) {
      const newToolbar = currentFactory();
      setToolbar(newToolbar);
      childContainer.register({
        token: ToolbarInstance,
        useValue: newToolbar,
      });
    } else {
      setToolbar(undefined);
    }
  }, [childContainer, currentFactory, props.toolbar]);

  useEffect(() => {
    if (toolbar && !toolbar.disposed) {
      toolbar.setCurrentArgs(data);
      toolbar.tooltip = tooltip;
      if (childContainer) {
        childContainer.register({
          token: ToolbarArgs,
          useValue: data,
        });
      }
      setContextReady(true);
    }
    return () => {
      setContextReady(false);
    };
  }, [childContainer, data, toolbar, tooltip]);

  useUnmount(() => {
    if (toolbar) {
      toolbar.dispose();
    }
  });
  if (!toolbar || !contextReady) {
    return null;
  }
  return (
    <ObservableContext.Provider
      value={{ getContainer: () => childContainer || context.getContainer() }}
    >
      {[...registry.items].map((item) => (
        <ToolbarItemKeeper
          key={item[1].id}
          item={item[1]}
          toolbar={toolbar}
          data={data}
        />
      ))}
      <ToolbarVisiblesRender toolbar={toolbar} />
    </ObservableContext.Provider>
  );
});
