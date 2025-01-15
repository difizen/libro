import { BaseView, view, ViewInstance } from '@difizen/mana-app';
import { singleton, inject } from '@difizen/mana-app';
import { useInject } from '@difizen/mana-app';
import { ViewStorage } from '@difizen/mana-app';
import { Switch } from 'antd';
import * as React from 'react';

export const StorageViewSwitch: React.ForwardRefExoticComponent<any> = React.forwardRef(
  function StorageViewSwitch(props, ref: React.ForwardedRef<HTMLDivElement>) {
    const viewInstance = useInject<StorageViewSwitchView>(ViewInstance);
    const viewStorage = useInject<ViewStorage>(ViewStorage);
    return (
      <div ref={ref}>
        <Switch
          checked={viewStorage.canStoreView}
          onChange={(val) => viewInstance.change(val)}
        />
      </div>
    );
  },
);

@singleton()
@view('view-storage-switch')
export class StorageViewSwitchView extends BaseView {
  override view = StorageViewSwitch;
  readonly viewStorage: ViewStorage;
  constructor(
    @inject(ViewStorage)
    viewStorage: ViewStorage,
  ) {
    super();
    this.viewStorage = viewStorage;
  }

  change(val: boolean) {
    if (val) {
      this.viewStorage.enableStoreView();
    } else {
      this.viewStorage.disableStoreView();
    }
  }
}
