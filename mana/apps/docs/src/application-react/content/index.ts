import { ManaModule } from '@difizen/mana-app';

import { ContentView } from './content-view.js';

export * from './content-view.js';

export const ContentModule = ManaModule.create().register(ContentView);
