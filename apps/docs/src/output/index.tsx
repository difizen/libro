import { LibroJupyterModule } from '@difizen/libro';
import {
  ManaAppPreset,
  ManaComponents,
  ManaModule,
} from '@difizen/libro-common/mana-app';

import { LibroApp } from './app.js';
import { ExampleContentContribution } from './content.js';
import './index.less';

const BaseModule = ManaModule.create().register(LibroApp, ExampleContentContribution);

const App = (): JSX.Element => {
  return (
    <div className="libro-example-output">
      <ManaComponents.Application
        key={'libro'}
        asChild={true}
        modules={[ManaAppPreset, LibroJupyterModule, BaseModule]}
      />
    </div>
  );
};

export default App;
