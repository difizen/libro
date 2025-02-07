/* eslint-disable react-hooks/exhaustive-deps */
import { ToolbarRender, useInject, ViewInstance } from '@difizen/libro-common/mana-app';
import type { FC } from 'react';
import { useMemo } from 'react';

import { LibroToolbarArea } from '../libro-protocol.js';
import type { LibroView } from '../libro-view.js';

export const LibroViewHeader: FC = () => {
  const instance = useInject<LibroView>(ViewInstance);
  const headerLeftArgs = useMemo(() => {
    return [instance.model.active, instance, LibroToolbarArea.HeaderLeft];
  }, [instance.model.active, instance]);
  const headerCenterArgs = useMemo(() => {
    return [instance.model.active, instance, LibroToolbarArea.HeaderCenter];
  }, [instance.model.active, instance]);
  const headerRightArgs = useMemo(() => {
    return [instance.model.active, instance, LibroToolbarArea.HeaderRight];
  }, [instance.model.active, instance]);
  return (
    <>
      <div className="libro-header-left">
        <ToolbarRender data={headerLeftArgs} />
      </div>
      <div className="libro-header-center">
        <ToolbarRender data={headerCenterArgs} />
      </div>
      <div className="libro-header-right">
        <ToolbarRender data={headerRightArgs} />
      </div>
    </>
  );
};
