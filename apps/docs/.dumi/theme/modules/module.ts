import { ManaAppPreset, ManaModule } from '@difizen/mana-app';

import { Github } from './github.js';

export const DumiPreset = ManaModule.create().register(Github).dependOn(ManaAppPreset);
