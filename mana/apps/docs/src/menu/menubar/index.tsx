import {
  ManaModule,
  ManaAppPreset,
  ManaComponents,
  MenuBarRender,
  MAIN_MENU_BAR,
} from '@difizen/mana-app';

import { Menus, Model } from './menu';

export const BaseModule = ManaModule.create().register(Menus, Model);

const App = (): JSX.Element => {
  return (
    <ManaComponents.Application
      asChild={true}
      modules={[ManaAppPreset, BaseModule]}
      renderChildren
    >
      <MenuBarRender menuPath={MAIN_MENU_BAR} />
    </ManaComponents.Application>
  );
};

export default App;
