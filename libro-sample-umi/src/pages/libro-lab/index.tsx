import React from 'react';
import { ManaAppPreset, ManaComponents } from '@difizen/mana-app';
import { LabModule } from '@/modules/libro-lab/module';
import './index.less';

const App = (): JSX.Element => {
  return (
    <div className="libro-workbench-app">
      <ManaComponents.Application
        key="libro-lab"
        asChild={true}
        modules={[ManaAppPreset, LabModule]}
      />
    </div>
  );
};

export default App;
