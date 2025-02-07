import { Syringe } from '../../mana-syringe/index.js';

import type { KeybindingRegistry } from './keybinding';

export const KeybindingContribution = Syringe.defineToken('KeybindingContribution');
/**
 * Allows extensions to contribute {@link common.Keybinding}s
 */
export type KeybindingContribution = {
  /**
   * Registers keybindings.
   * @param keybindings the keybinding registry.
   */
  registerKeybindings: (keybindings: KeybindingRegistry) => void;
};
