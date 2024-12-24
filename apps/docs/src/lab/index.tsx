import { LibroLabModule } from '@difizen/libro-lab';
import { ManaAppPreset, ManaComponents, ManaModule } from '@difizen/mana-app';

import { LibroApp } from './app.js';
import './index.less';
import { SettingModule } from './modules/setting/index.js';

const BaseModule = ManaModule.create().register(LibroApp).dependOn(SettingModule);

const App = (): JSX.Element => {
  return (
    <div className="libro-workbench-app">
      <ManaComponents.Application
        key="libro-lab"
        asChild={true}
        modules={[ManaAppPreset, LibroLabModule, BaseModule, SettingModule]}
      />
    </div>
  );
};

export default App;
