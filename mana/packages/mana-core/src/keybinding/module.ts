import { BrowserKeyboardLayoutProvider, KeyboardLayoutService } from '../keyboard';
import { ManaModule } from '../module';

import { ContextKeyService } from './context-key-service';
import { KeybindingContext, KeybindingRegistry } from './keybinding';
import { KeybindingContribution } from './keybinding-proocol';
import { ConfigurationService } from './vs/configuration/configurationService';
import { VSContextKeyService } from './vs/contextKeyService';

export const KeybindModule = ManaModule.create()
  .contribution(KeybindingContribution, KeybindingContext)
  .register(
    VSContextKeyService,
    ContextKeyService,
    KeybindingRegistry,

    // keyboard
    BrowserKeyboardLayoutProvider,
    KeyboardLayoutService,

    // configuration
    ConfigurationService,
  );
