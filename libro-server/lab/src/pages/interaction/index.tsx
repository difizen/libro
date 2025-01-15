import {
  HeaderArea,
  HeaderView,
  ManaAppPreset,
  ManaComponents,
  ManaModule,
  RootSlotId,
  createSlotPreference,
} from '@difizen/mana-app';
import { BrandView } from '@difizen/libro-lab';

import { LibroJupyterModule } from '@difizen/libro-jupyter';
import { CommonWidgetsModule } from '@difizen/libro-widget';
import { LibroApp } from './app.js';
import { LibroExecutionView } from './execution-view.js';
import { LibroExecutionLayoutSlots, LibroExecutionLayoutView } from './layout.js';
import { LibroExecutionFileView } from './execution-file.js';
import { LibroAppView } from './libro-app-view.js';

const BaseModule = ManaModule.create().register(
  LibroApp,
  LibroExecutionView,
  LibroExecutionLayoutView,
  LibroExecutionFileView,
  BrandView,
  LibroAppView,
  createSlotPreference({
    slot: RootSlotId,
    view: LibroExecutionLayoutView,
  }),
  createSlotPreference({
    slot: LibroExecutionLayoutSlots.header,
    view: HeaderView,
  }),
  createSlotPreference({
    slot: HeaderArea.middle,
    view: LibroExecutionFileView,
  }),
  createSlotPreference({
    slot: HeaderArea.left,
    view: BrandView,
  }),
  createSlotPreference({
    slot: LibroExecutionLayoutSlots.content,
    view: LibroExecutionView,
  }),
);

const LibroExecution = (): JSX.Element => {
  return (
    <div className="libro-execution">
      <ManaComponents.Application
        key="libro-execution"
        asChild={true}
        modules={[ManaAppPreset, LibroJupyterModule, CommonWidgetsModule, BaseModule]}
      />
    </div>
  );
};

export default LibroExecution;
