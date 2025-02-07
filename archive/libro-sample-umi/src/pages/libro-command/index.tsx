import React from 'react';
import { ManaAppPreset, ManaComponents } from '@difizen/mana-app';
import './index.less';
import { LibroCommandDemo } from './libro-command-demo';
import { LibroCommandDemoModule } from '@/modules/libro-command/module';

const App = (): JSX.Element => {
  return (
    <div className="libro-command-demo">
      <ManaComponents.Application
        key="libro-command"
        asChild={true}
        modules={[ManaAppPreset, LibroCommandDemoModule]}
        renderChildren
      >
        <LibroCommandDemo />
      </ManaComponents.Application>
    </div>
  );
};

export default App;
