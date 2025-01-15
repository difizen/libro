import { ManaAppPreset, ManaComponents } from '@difizen/mana-app';
import React from 'react';

import { LibroToolbarDemoModule } from '@/modules/libro-toolbar/module';

import { LibroToolbarDemo } from './libro-toolbar';

const App = (): JSX.Element => {
  return (
    <div className="libro-editor-demo">
      <ManaComponents.Application
        key="libro-editor"
        asChild={true}
        modules={[ManaAppPreset, LibroToolbarDemoModule]}
        renderChildren
      >
        <LibroToolbarDemo />
      </ManaComponents.Application>
    </div>
  );
};

export default App;
