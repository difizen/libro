import { LibroLabModule } from '@difizen/libro';
import {
  ManaAppPreset,
  ManaComponents,
  ManaModule,
} from '@difizen/libro-common/mana-app';

import { LibroApp } from './app.js';
import './index.less';

const BaseModule = ManaModule.create().register(LibroApp);

const App = (): JSX.Element => {
  return (
    <div className="libro-workbench-app">
      <ManaComponents.Application
        key="libro-lab"
        asChild={true}
        modules={[ManaAppPreset, LibroLabModule, BaseModule]}
      />
    </div>
  );
};

export default App;
