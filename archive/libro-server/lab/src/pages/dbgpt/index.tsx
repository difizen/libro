import { LibroLabApp, LibroLabCurrentFileFooterView, LibroLabLayoutView, LibroLabModule, WelcomeView } from '@difizen/libro-lab';
import { ManaAppPreset, ManaComponents, ManaModule, Syringe } from '@difizen/mana-app';

import { LibroApp } from './app.js';
import './index.less';
import { LibroPromptScript } from './prompt-script.js';
import { PromptScript, LibroPromptCellModuleSetting } from '@difizen/libro-prompt-cell';
import { LibroAINativeModuleSetting } from '@difizen/libro-ai-native';
import { LibroSchemaFormWidgetModule } from './schema-form-widget/index.js';
import { LibroDbgptLayoutView } from './dbgbt-layout.js'
import { LibroDbgptLabCurrentFileFooterView } from './dbgpt-current-file-footer-view.js'
import { FetcherModule } from '@difizen/magent-core';
import { DbgptWelcomeView } from './dbgpt-welcome-view.js';

LibroAINativeModuleSetting.loadable = false;
LibroPromptCellModuleSetting.loadable = false;

const BaseModule = ManaModule.create().register({
  token:LibroLabApp,
  useClass:LibroApp
},
  {
    token: PromptScript,
    useClass: LibroPromptScript,
    lifecycle: Syringe.Lifecycle.singleton,
  },
  {
    token:LibroLabLayoutView,
    useClass:LibroDbgptLayoutView
  },
  {
    token:LibroLabCurrentFileFooterView,
    useClass:LibroDbgptLabCurrentFileFooterView
  },
  {
    token:WelcomeView,
    useClass:DbgptWelcomeView
  }
);

const App = (): JSX.Element => {
  return (
    <div className="libro-workbench-app">
      <ManaComponents.Application
        key="libro"
        asChild={true}
        modules={[
          ManaAppPreset,
          LibroLabModule,
          FetcherModule,
          BaseModule,
          LibroSchemaFormWidgetModule,
        ]}
      />
    </div>
  );
};

export default App;
