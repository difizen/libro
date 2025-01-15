import { ManaModule } from '@difizen/mana-app';

import { State } from './state';

export const BaseModule = ManaModule.create().register(State);
