import { ManaAppPreset, ManaComponents } from '@difizen/mana-app';
import React from 'react';

import { LibroEditorModule } from '@/modules/libro-editor/module';

import { LibroEditor } from './libro-editor';

const App = (): JSX.Element => {
  return (
    <div className="libro-editor-demo">
      <ManaComponents.Application
        key="libro-editor"
        asChild={true}
        modules={[ManaAppPreset, LibroEditorModule]}
        renderChildren
      >
        <LibroEditor />
      </ManaComponents.Application>
    </div>
  );
};

export default App;
