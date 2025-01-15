import { ManaModule } from '@difizen/mana-app';

import { State } from './state';

export const AppModule = ManaModule.create().register(State);

export default AppModule;
