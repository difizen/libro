import { ManaAppPreset, ManaComponents } from '@difizen/mana-app';

import { FileModule } from './module.js';

const App = (): JSX.Element => {
  return (
    <ManaComponents.Application
      asChild={true}
      modules={[ManaAppPreset, FileModule]}
    ></ManaComponents.Application>
  );
};

export default App;
