import { ManaModule } from '@difizen/libro-common/mana-app';

import { KeybindInstructionsContribution } from './keybind-instructions-contribution.js';
import { LibroKeybindItems } from './keybind-instructions-items.js';
import { KeybindInstrutionsService } from './keybind-instructions-view.js';

export const KeybindInstructionsModule = ManaModule.create().register(
  KeybindInstrutionsService,
  LibroKeybindItems,
  KeybindInstructionsContribution,
);
