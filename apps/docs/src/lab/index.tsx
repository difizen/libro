import { LibroLabModule } from '@difizen/libro-lab';
import { ManaAppPreset, ManaComponents, ManaModule } from '@difizen/mana-app';

import { LibroApp } from './app.js';
import './index.less';

const BaseModule = ManaModule.create().register(LibroApp);

const App = (): JSX.Element => {
  return (
    <div className="libro-workbench-app">
      <ManaComponents.Application
        key={'libro'}
        asChild={true}
        modules={[ManaAppPreset, LibroLabModule, BaseModule]}
      />
    </div>
  );
};

export default App;
