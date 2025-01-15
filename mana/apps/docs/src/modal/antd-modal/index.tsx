import {
  createSlotPreference,
  ManaComponents,
  ManaModule,
  RootSlotId,
  ManaAppPreset,
} from '@difizen/mana-app';

import { ModalContainerView } from './modal-container-view.js';
import { DemoModalContribution } from './modal-contribution.js';

const BaseModule = ManaModule.create().register(
  ModalContainerView,
  createSlotPreference({
    view: ModalContainerView,
    slot: RootSlotId,
  }),
  DemoModalContribution,
);

const App = (): JSX.Element => {
  return (
    <ManaComponents.Application asChild={true} modules={[ManaAppPreset, BaseModule]} />
  );
};

export default App;
