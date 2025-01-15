import {
  createSlotPreference,
  ManaComponents,
  ManaModule,
  RootSlotId,
  ManaAppPreset,
  ModalService,
  Syringe,
} from '@difizen/mana-app';

import { ModalContainerView } from './modal-container-view.js';
import { DemoModalContribution } from './modal-contribution.js';
import { MyModalService } from './my-modal-service.js';

const BaseModule = ManaModule.create().register(
  ModalContainerView,
  {
    token: ModalService,
    useClass: MyModalService,
    lifecycle: Syringe.Lifecycle.singleton,
  },
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
