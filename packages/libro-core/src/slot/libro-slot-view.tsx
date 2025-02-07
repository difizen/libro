import type { View, ViewOpenOption, Disposable } from '@difizen/libro-common/app';
import {
  DefaultSlotView,
  view,
  ViewRender,
  ViewInstance,
} from '@difizen/libro-common/app';
import { transient } from '@difizen/libro-common/app';
import { equals, prop, useInject } from '@difizen/libro-common/app';
import { forwardRef } from 'react';

import { isDisplayView } from './libro-slot-protocol.js';

export const LibroExtensionViewComponent = forwardRef(
  function LibroExtensionViewComponent(props, ref: React.ForwardedRef<HTMLDivElement>) {
    const instance = useInject<LibroSlotView>(ViewInstance);
    //过滤出实现了DisplayView接口的View,用于控制抢占逻辑
    const filteredChildren = instance.children.filter((item) => {
      return isDisplayView(item) && item.isDisplay;
    });
    if (filteredChildren.length < 1) {
      return (
        <div className={'libro-slot-container'} ref={ref}>
          {instance.children.map(
            (item) => !isDisplayView(item) && <ViewRender view={item} key={item.id} />,
          )}
        </div>
      );
    } else {
      const activeView = filteredChildren.find(
        (item) => instance.active && equals(item, instance.active),
      );
      return (
        <div className={'libro-slot-container'} ref={ref}>
          {activeView && <ViewRender view={activeView} />}
          {instance.children.map(
            (item) => !isDisplayView(item) && <ViewRender view={item} key={item.id} />,
          )}
        </div>
      );
    }
  },
);

@transient()
@view('libro-slot-view')
export class LibroSlotView extends DefaultSlotView {
  override label: React.ReactNode = null;
  override view = LibroExtensionViewComponent;
  @prop()
  override sort?: boolean = false;
  // sort?: boolean = true;

  protected history: View[] = [];

  override async addView(
    viewInstance: View,
    option?: ViewOpenOption,
  ): Promise<Disposable> {
    if (option?.reveal) {
      this.history.push(viewInstance);
    }
    const toDispose = super.addView(viewInstance, option);
    return toDispose;
  }

  revertActive() {
    const index = this.history.findIndex((item) => item.id === this.active?.id);
    if (index < 0) {
      return;
    }
    this.history.splice(index, 1);
    if (this.history.length > 0) {
      const last = this.history[this.history.length - 1];
      this.active = last;
    } else {
      this.active = undefined;
    }
  }
}
