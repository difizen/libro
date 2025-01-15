import {
  ManaModule,
  ManaAppPreset,
  useInject,
  ManaComponents,
  MenuRender,
  MAIN_MENU_BAR,
} from '@difizen/mana-app';
import { Dropdown } from '@difizen/mana-react';

import { Menus, Model } from './menu';

export const BaseModule = ManaModule.create().register(Menus, Model);

const MyMenu = () => {
  const model = useInject(Model);
  return <MenuRender data={[model]} menuPath={MAIN_MENU_BAR} />;
};

const App = (): JSX.Element => {
  return (
    <ManaComponents.Application
      asChild={true}
      modules={[ManaAppPreset, BaseModule]}
      renderChildren
    >
      <Dropdown trigger={['contextMenu']} overlay={<MyMenu />}>
        <div
          role="button"
          style={{
            border: '1px solid #000',
            padding: '100px 0',
            textAlign: 'center',
          }}
        >
          Right click me!
        </div>
      </Dropdown>
    </ManaComponents.Application>
  );
};

export default App;
