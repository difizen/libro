import { ManaModule } from '../module';

import { DefaultSlotView } from './default-slot-view';
import { DefaultOpenerService, OpenHandler } from './open-handler';
import { RootComponents, RootView } from './root-view';
import { SlotViewManager } from './slot-view-manager';
import { ViewApplication } from './view-application';
import { ViewManager } from './view-manager';
import { ViewOpenHandler } from './view-open-handler';
import { ViewInstance, ViewPreferenceContribution } from './view-protocol';
import { ViewFactory } from './view-protocol';
import { SlotPreferenceContribution } from './view-protocol';
import { ViewStorage } from './view-storage';

export const ViewModule = ManaModule.create()
  .contribution(
    ViewFactory,
    ViewPreferenceContribution,
    SlotPreferenceContribution,
    OpenHandler,
  )
  .register(
    RootView,
    DefaultSlotView,
    ViewStorage,
    ViewApplication,
    SlotViewManager,
    ViewManager,
    DefaultOpenerService,
    ViewOpenHandler,
  )
  // register top level ViewInstance
  // TODO: remove this when we have a better way to register top level ViewInstance
  .register({
    token: ViewInstance,
    useValue: {},
  })
  .register({
    token: RootComponents,
    useValue: {},
  });
