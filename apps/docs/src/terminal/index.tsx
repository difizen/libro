import { TerminalDemoModule } from '@difizen/libro-terminal';
import { ManaAppPreset, ManaComponents, ManaModule } from '@difizen/mana-app';

import { LibroApp } from './app.js';
import './index.less';

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
