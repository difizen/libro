import React from 'react';
import { ManaAppPreset, ManaComponents } from '@difizen/mana-app';
import { LabModule } from '@/modules/libro-lab/module';
import './index.less';
import { LibroGeneralDemoCellModule } from '@/modules/libro-cell/libro-general-demo-cell/module';
import { LibroEditorDemoCellModule } from '@/modules/libro-cell/libro-editor-demo-cell/module';

const App = (): JSX.Element => {
  return (
    <div className="libro-workbench-app">
      <ManaComponents.Application
        key="libro-cell"
        asChild={true}
        modules={[
          ManaAppPreset,
          LabModule,
          LibroGeneralDemoCellModule,
          LibroEditorDemoCellModule,
        ]}
      />
    </div>
  );
};

export default App;
