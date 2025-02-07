import { LibroCellView } from '@difizen/libro-jupyter';
import type { ViewComponent } from '@difizen/mana-app';
import { useInject } from '@difizen/mana-app';
import { view, ViewInstance } from '@difizen/mana-app';
import React, { useEffect, useState } from 'react';

import type { LibroGeneralDemoCellModel } from './libro-general-demo-cell-model';

export const LibroGeneralDemoCellComponent = React.forwardRef(
  function LibroCellComponent() {
    const instance = useInject<LibroGeneralDemoCellView>(ViewInstance);
    const [time, setTime] = useState(new Date());

    // 使用 useEffect 来设置定时器，每秒更新一次时间
    useEffect(() => {
      const timer = setInterval(() => {
        const curTime = new Date();
        setTime(curTime);
        instance.model.value = curTime.toTimeString();
      }, 1000);

      // 清除定时器，避免内存泄漏
      return () => clearInterval(timer);
    }, [instance.model]);

    return (
      <div>
        <h3>上次使用 notebook 的时间</h3>
        <h4>{(instance.model as LibroGeneralDemoCellModel).lastUseTime}</h4>
        <h3>当前时间</h3>
        <h4>{time.toTimeString()}</h4>
      </div>
    );
  },
);

@view('libro-general-demo-cell-view')
export class LibroGeneralDemoCellView extends LibroCellView {
  view: ViewComponent = LibroGeneralDemoCellComponent;
}
