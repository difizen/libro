import { LibroJupyterModule } from '@difizen/libro';
import {
  ManaAppPreset,
  ManaComponents,
  ManaModule,
  createSlotPreference,
  RootSlotId,
  CardTabView,
  FileTreeView,
} from '@difizen/libro-common/mana-app';

import { LibroApp } from './app.js';
import { LibroWorkbenchLayoutView, LibroWorkbenchSlots } from './layout/index.js';
import './index.less';

const BaseModule = ManaModule.create().register(
  LibroApp,
  LibroWorkbenchLayoutView,
  createSlotPreference({
    view: LibroWorkbenchLayoutView,
    slot: RootSlotId,
  }),
  createSlotPreference({
    view: CardTabView,
    slot: LibroWorkbenchSlots.Main,
  }),
  createSlotPreference({
    view: FileTreeView,
    slot: LibroWorkbenchSlots.Left,
  }),
);

const App = (): JSX.Element => {
  return (
    <div className="libro-workbench-app">
      <ManaComponents.Application
        key={'libro'}
        asChild={true}
        modules={[ManaAppPreset, LibroJupyterModule, BaseModule]}
      />
    </div>
  );
};

export default App;
