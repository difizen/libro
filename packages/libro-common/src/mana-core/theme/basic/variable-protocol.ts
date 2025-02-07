import { Syringe } from '../../../mana-syringe/index.js';

import type { VariableRegistry } from './variable-registry';

export const VariableContribution = Syringe.defineToken('VariableContribution');
export type VariableContribution = {
  registerVariables: (vars: VariableRegistry) => void;
};
