import { ManaAppPreset, ManaComponents } from '@difizen/mana-app';
import React from 'react';

import { LibroKeybindDemoModule } from '@/modules/libro-keybind/module';

import { LibroKeybindDemo } from './libro-keybind-demo';

const App = (): JSX.Element => {
  return (
    <div className="libro-keybind-demo">
      <ManaComponents.Application
        key="libro-keybind"
        asChild={true}
        modules={[ManaAppPreset, LibroKeybindDemoModule]}
        renderChildren
      >
        <LibroKeybindDemo />
      </ManaComponents.Application>
    </div>
  );
};

export default App;
