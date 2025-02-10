import { AppExtention } from '@difizen/libro-lab';

import { LibroApp } from './app.js';
import { TerminalDemoModule } from './demo-module/index.js';
import './index.less';

const { ManaAppPreset, ManaComponents, ManaModule } = AppExtention;

const BaseModule = ManaModule.create().register(LibroApp);

const App = (): JSX.Element => {
  return (
    <div className="libro-terminal-app">
      <ManaComponents.Application
        key={'libro'}
        asChild={true}
        modules={[ManaAppPreset, BaseModule, TerminalDemoModule]}
      ></ManaComponents.Application>
    </div>
  );
};

export default App;
